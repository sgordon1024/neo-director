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
@main struct Scene {
    static func main() async {
        DispatchQueue.global().asyncAfter(deadline: .now()+20) { print("{\"ok\":false,\"error\":\"Scene analysis timed out\"}"); exit(124) }
        do {
            let args=Array(CommandLine.arguments.dropFirst())
            guard args.count==2, ["image","video"].contains(args[0]) else { throw NSError(domain:"scene",code:1) }
            let url=URL(fileURLWithPath:args[1])
            let values=try url.resourceValues(forKeys:[.isRegularFileKey,.fileSizeKey])
            guard values.isRegularFile==true, let size=values.fileSize, size>0, size<=50_000_000 else { throw NSError(domain:"scene",code:2) }
            let hash=SHA256.hash(data:try Data(contentsOf:url)).map{String(format:"%02x",$0)}.joined()
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
