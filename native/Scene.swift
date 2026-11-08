import Foundation
import Vision
import AppKit
import AVFoundation
import CryptoKit

func sceneReport(_ image: CGImage, sourceHash: String, frameTime: Double?) throws -> Data {
    let classification = VNClassifyImageRequest()
    let animals = VNRecognizeAnimalsRequest()
    try VNImageRequestHandler(cgImage: image, options: [:]).perform([classification, animals])
    let candidates: [[String: Any]] = (classification.results ?? []).prefix(8).map { ["label": $0.identifier, "score": $0.confidence] }
    let animalCandidates: [[String: Any]] = (animals.results ?? []).compactMap { observation in
        guard let label = observation.labels.first else { return nil }
        let box = observation.boundingBox
        return ["label": label.identifier, "score": label.confidence, "box": ["x": box.minX, "y": box.minY, "width": box.width, "height": box.height]]
    }
    var result: [String: Any] = ["schema": 1, "mode": "scene-observation-only", "engine": "Apple Vision image classification and animal detection", "sourceSHA256": sourceHash, "width": image.width, "height": image.height, "classifications": candidates, "animalCandidates": animalCandidates, "safetyAssessment": "unknown", "requiresHumanReview": true, "limitations": ["Scores are model outputs, not calibrated probabilities", "A detected dog is not proof of pet identity", "No detection does not prove absence", "No distance, obstacle avoidance or flight clearance inference", "Frame evidence never executes a command"]]
    if let frameTime { result["frameTimeSeconds"] = frameTime }
    return try JSONSerialization.data(withJSONObject: result, options: [.prettyPrinted, .sortedKeys])
}

// Opt-in, bounded sampling. Existing image/video entry points remain unchanged.
func sampledVideoReport(_ url: URL, sourceHash: String) async throws -> Data {
    let asset = AVURLAsset(url: url)
    let duration = try await asset.load(.duration).seconds
    guard duration.isFinite, duration > 0, duration <= 120 else { throw NSError(domain: "scene", code: 4) }
    let generator = AVAssetImageGenerator(asset: asset)
    generator.appliesPreferredTrackTransform = true
    generator.maximumSize = CGSize(width: 1920, height: 1080)
    // Explicit tolerance; report actual decoded times, never pretend requested times were observed.
    generator.requestedTimeToleranceBefore = CMTime(seconds: 0.25, preferredTimescale: 600)
    generator.requestedTimeToleranceAfter = CMTime(seconds: 0.25, preferredTimescale: 600)
    var frames: [[String: Any]] = []
    var previous = -1.0
    for index in 0..<5 {
        let requested = duration * Double(index) / 5.0
        let result = try await generator.image(at: CMTime(seconds: requested, preferredTimescale: 600))
        let actual = result.actualTime.seconds
        guard actual.isFinite, actual >= 0, actual <= duration, actual >= previous else { throw NSError(domain: "scene", code: 5) }
        if actual == previous { continue } // A short clip may resolve multiple requests to one frame.
        previous = actual
        let image = result.image
        let data = try await Task.detached { try sceneReport(image, sourceHash: sourceHash, frameTime: actual) }.value
        guard let frame = try JSONSerialization.jsonObject(with: data) as? [String: Any] else { throw NSError(domain: "scene", code: 6) }
        frames.append(frame)
    }
    guard !frames.isEmpty else { throw NSError(domain: "scene", code: 7) }
    let report: [String: Any] = ["schema": 2, "mode": "video-sample-observation-only", "sourceSHA256": sourceHash, "durationSeconds": duration, "sampling": "five-uniform-requests-first-80-percent", "frames": frames, "safetyAssessment": "unknown", "requiresHumanReview": true, "limitations": ["Sparse decoded samples, not continuous coverage or tracking", "Events between samples and near the end may be missed", "Dog category is not Frank identity", "No flight or safety assessment"]]
    return try JSONSerialization.data(withJSONObject: report, options: [.prettyPrinted, .sortedKeys])
}

@main struct Scene {
    static func main() async {
        DispatchQueue.global().asyncAfter(deadline: .now()+20) { print("{\"ok\":false,\"error\":\"Scene analysis timed out\"}"); exit(124) }
        do {
            let args=Array(CommandLine.arguments.dropFirst())
            guard args.count==2, ["image","video","video-sample"].contains(args[0]) else { throw NSError(domain:"scene",code:1) }
            let url=URL(fileURLWithPath:args[1])
            let values=try url.resourceValues(forKeys:[.isRegularFileKey,.fileSizeKey])
            guard values.isRegularFile==true, let size=values.fileSize, size>0, size<=50_000_000 else { throw NSError(domain:"scene",code:2) }
            let hash=SHA256.hash(data:try Data(contentsOf:url)).map{String(format:"%02x",$0)}.joined()
            if args[0] == "video-sample" {
                let data = try await sampledVideoReport(url, sourceHash: hash)
                print(String(decoding: data, as: UTF8.self))
                return
            }
            let image:CGImage
            var time:Double?=nil
            if args[0]=="image" {
                guard let source=CGImageSourceCreateWithURL(url as CFURL,nil),
                      let metadata=CGImageSourceCopyPropertiesAtIndex(source,0,nil) as? [CFString:Any],
                      let w=metadata[kCGImagePropertyPixelWidth] as? Int, let h=metadata[kCGImagePropertyPixelHeight] as? Int,
                      w>0,h>0,w<=12000,h<=12000,
                      let decoded=CGImageSourceCreateImageAtIndex(source,0,nil) else { throw NSError(domain:"scene",code:3) }
                image=decoded
            } else {
                let generator=AVAssetImageGenerator(asset:AVURLAsset(url:url))
                generator.appliesPreferredTrackTransform=true;generator.maximumSize=CGSize(width:1920,height:1080)
                let frame=try await generator.image(at:.zero);image=frame.image;time=frame.actualTime.seconds
            }
            let frameTime=time
            let data=try await Task.detached { try sceneReport(image,sourceHash:hash,frameTime:frameTime) }.value
            print(String(decoding:data,as:UTF8.self))
        } catch { print("{\"ok\":false,\"error\":\"Unsupported input or local scene analysis failed; no cloud fallback\"}");exit(1) }
    }
}
