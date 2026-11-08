import Foundation
import Speech
import AVFoundation

// Bundled synthetic audio only. Never opens a microphone or requests permissions.
func transcribeSyntheticFixture() async -> [String:Any] {
 guard SpeechTranscriber.isAvailable,
       let locale=await SpeechTranscriber.supportedLocale(equivalentTo:Locale(identifier:"en-US")) else {
  return ["passed":false,"blocker":"SpeechTranscriber unavailable in this runtime"]
 }
 let module=SpeechTranscriber(locale:locale,preset:.transcription)
 let state=await AssetInventory.status(forModules:[module])
 let installed=await SpeechTranscriber.installedLocales
 guard state == .installed || (state == .supported && installed.contains(where:{$0.identifier==locale.identifier})) else {
  return ["passed":false,"blocker":"Required speech assets not installed; no download attempted","assetState":String(describing:state)]
 }
 do {
  guard try await AssetInventory.assetInstallationRequest(supporting:[module]) == nil else {
   return ["passed":false,"blocker":"Speech installation would be required; no download attempted"]
  }
  guard let url=Bundle.main.url(forResource:"synthetic-brief",withExtension:"aiff") else {return ["passed":false,"blocker":"Synthetic fixture missing"]}
  let file=try AVAudioFile(forReading:url)
  guard Double(file.length)/file.processingFormat.sampleRate<15 else{return ["passed":false,"blocker":"Fixture exceeds duration limit"]}
  let analyzer=SpeechAnalyzer(modules:[module])
  let collector=Task{()throws->String in
   var texts:[String]=[]
   for try await result in module.results {if result.isFinal{texts.append(String(result.text.characters))}}
   return texts.joined(separator:" ")
  }
  let timeout=Task{try? await Task.sleep(for:.seconds(20));if !Task.isCancelled{collector.cancel();await analyzer.cancelAndFinishNow()}}
  defer{timeout.cancel()}
  do {
   let end=try await analyzer.analyzeSequence(from:file)
   if let end{try await analyzer.finalizeAndFinish(through:end)}else{try await analyzer.finalizeAndFinishThroughEndOfInput()}
   let text=try await collector.value
   let matches=LocalPlan.preserves(text,subject:"frank",style:"calm",count:4)
   return ["passed":matches,"transcript":text,"microphoneOpened":false,"requiresReview":true]
  }catch{collector.cancel();await analyzer.cancelAndFinishNow();throw error}
 }catch{return ["passed":false,"blocker":"Local file transcription failed; no fallback","errorCode":(error as NSError).code]}
}
