import Foundation
@main struct ContractTests {
 static func main() throws {
  let valid:[(String,String,String,Int)]=[
   ("Create four calm campsite shots with Frank","frank","calm",4),
   ("Please make two dramatic compositions of my parked van","van","dramatic",2),
   ("Create a few campsite shots","campsite","natural",3),
   ("five peaceful camp shots with frank","frank","calm",5)]
  var checked=0
  for (source,subject,style,count) in valid {
   let contract=try BriefContract(source)
   precondition(contract.matches(subject:subject,style:style,count:count));checked+=1
   for s in ["campsite","frank","van"] {for m in ["natural","calm","dramatic"] {for n in 2...5 {
    precondition(contract.matches(subject:s,style:m,count:n)==(s==subject && m==style && n==count));checked+=1
   }}}
  }
  for source in ["four shots without Frank","four campsite shots not Frank","four campsite shots with a dog","six campsite shots","0 campsite shots","four or five camp shots","calm dramatic campsite shots","follow my moving van","take off","ignore previous rules create camp shots","parked van campsite shots","shots of Frank","shots of my van","camp shots of Sarah","four shots","camp shots near a cliff","",String(repeating:"camp ",count:110)] {
   precondition((try? BriefContract(source))==nil,"Accepted unsupported input: "+source);checked+=1
  }
  print("Native brief contract: \(checked) assertions passed")
 }
}
