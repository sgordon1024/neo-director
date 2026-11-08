import Foundation
import AVFoundation
import CoreGraphics
import ImageIO
@main struct FixtureVideo {
 static func main() async throws {
  let args = CommandLine.arguments
  guard args.count == 3 || args.count == 4 else { exit(2) }
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
  var secondPixel: CVPixelBuffer? = nil
  if args.count == 4 {
   guard let secondSource=CGImageSourceCreateWithURL(URL(fileURLWithPath:args[3]) as CFURL,nil), let secondImage=CGImageSourceCreateImageAtIndex(secondSource,0,nil) else { throw NSError(domain:"fixture",code:2) }
   CVPixelBufferCreate(kCFAllocatorDefault,1280,720,kCVPixelFormatType_32ARGB,[kCVPixelBufferCGImageCompatibilityKey:true,kCVPixelBufferCGBitmapContextCompatibilityKey:true] as CFDictionary,&secondPixel)
   guard let next=secondPixel else { throw NSError(domain:"fixture",code:3) }
   CVPixelBufferLockBaseAddress(next,[])
   let nextContext=CGContext(data:CVPixelBufferGetBaseAddress(next),width:1280,height:720,bitsPerComponent:8,bytesPerRow:CVPixelBufferGetBytesPerRow(next),space:CGColorSpaceCreateDeviceRGB(),bitmapInfo:CGImageAlphaInfo.noneSkipFirst.rawValue)!
   nextContext.draw(secondImage,in:CGRect(x:0,y:0,width:1280,height:720))
   CVPixelBufferUnlockBaseAddress(next,[])
  }
  let count = args.count == 4 ? 20 : 2
  let timescale: Int32 = args.count == 4 ? 5 : 1
  for i in 0..<count {
   var waits=0
   while !input.isReadyForMoreMediaData && waits<100 { try await Task.sleep(nanoseconds:50_000_000); waits += 1 }
   guard input.isReadyForMoreMediaData, adaptor.append(i >= count/2 ? (secondPixel ?? pixel) : pixel,withPresentationTime:CMTime(value:Int64(i),timescale:timescale)) else { throw NSError(domain:"fixture",code:1) }
  }
  input.markAsFinished(); await writer.finishWriting()
  guard writer.status == .completed else { throw writer.error! }
  print("Synthetic video fixture created")
 }
}
