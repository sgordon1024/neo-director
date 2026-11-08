import Foundation
import AVFoundation
import CoreGraphics
import ImageIO
@main struct FixtureVideo {
 static func main() async throws {
  let args = CommandLine.arguments
  guard args.count == 3 else { exit(2) }
  let source = CGImageSourceCreateWithURL(URL(fileURLWithPath: args[1]) as CFURL, nil)!
  let image = CGImageSourceCreateImageAtIndex(source, 0, nil)!
  let url = URL(fileURLWithPath: args[2])
  let writer = try AVAssetWriter(outputURL: url, fileType: .mov)
  let input = AVAssetWriterInput(mediaType: .video, outputSettings: [AVVideoCodecKey: AVVideoCodecType.h264, AVVideoWidthKey: 1280, AVVideoHeightKey: 720])
  let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32ARGB, kCVPixelBufferWidthKey as String: 1280, kCVPixelBufferHeightKey as String: 720])
  writer.add(input)
  guard writer.startWriting() else { throw writer.error! }
  writer.startSession(atSourceTime: .zero)
  var buffer: CVPixelBuffer?
  CVPixelBufferCreate(kCFAllocatorDefault,1280,720,kCVPixelFormatType_32ARGB,[kCVPixelBufferCGImageCompatibilityKey:true,kCVPixelBufferCGBitmapContextCompatibilityKey:true] as CFDictionary,&buffer)
  let pixel = buffer!
  CVPixelBufferLockBaseAddress(pixel,[])
  let context = CGContext(data:CVPixelBufferGetBaseAddress(pixel),width:1280,height:720,bitsPerComponent:8,bytesPerRow:CVPixelBufferGetBytesPerRow(pixel),space:CGColorSpaceCreateDeviceRGB(),bitmapInfo:CGImageAlphaInfo.noneSkipFirst.rawValue)!
  context.draw(image,in:CGRect(x:0,y:0,width:1280,height:720))
  CVPixelBufferUnlockBaseAddress(pixel,[])
  for i in 0..<2 {
   var waits=0
   while !input.isReadyForMoreMediaData && waits<100 { try await Task.sleep(nanoseconds:50_000_000); waits += 1 }
   guard input.isReadyForMoreMediaData, adaptor.append(pixel,withPresentationTime:CMTime(value:Int64(i),timescale:1)) else { throw NSError(domain:"fixture",code:1) }
  }
  input.markAsFinished(); await writer.finishWriting()
  guard writer.status == .completed else { throw writer.error! }
  print("Synthetic video fixture created")
 }
}
