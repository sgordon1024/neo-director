import Foundation
struct LocalPlan {
 let subject:String
 let style:String
 let count:Int
 var shots:[String] {
  let base:[String]
  switch subject {
  case "frank": base=["Wide campsite composition","Stationary Frank with handler, from an offset view","Camp detail with Frank outside the flight area","Static camp texture detail","Wide landscape with camp at edge"]
  case "van": base=["Parked van establishing composition","Static parked van detail","Wide parked van closing composition","Static van texture detail","Parked van against landscape"]
  default: base=["Wide campsite composition","Static camp detail","Offset wide closing composition","Static camp texture detail","Wide landscape with camp at edge"]
  }
  return Array(base.prefix(count)).map { $0+" · "+style+" framing" }
 }
 init(subject:String,style:String,count:Int)throws {
  guard ["campsite","frank","van"].contains(subject),["natural","calm","dramatic"].contains(style),(2...5).contains(count) else {throw NSError(domain:"Invalid brief",code:1)}
  self.subject=subject;self.style=style;self.count=count
 }
}

// Bounded contract, not general language understanding. Unknown or conflicting
// requests fail closed before invoking the optional generative model.
struct BriefContract {
 let plan:LocalPlan
 init(_ source:String)throws {
  let words=source.lowercased().split{!$0.isLetter && !$0.isNumber}.map(String.init)
  let set=Set(words)
  let allowed:Set<String>=["create","make","please","give","me","some","a","few","of","the","my","our","at","with","and","in","include","shots","shot","compositions","composition","campsite","camp","frank","parked","van","natural","calm","peaceful","dramatic","two","three","four","five","2","3","4","5"]
  guard !words.isEmpty,source.count<=500,set.isSubset(of:allowed) else{throw NSError(domain:"Unsupported or ambiguous request",code:1)}
  let counts=Set(words.compactMap{["two":2,"three":3,"four":4,"five":5,"2":2,"3":3,"4":4,"5":5][$0]})
  let styles=Set(words.compactMap{["natural":"natural","calm":"calm","peaceful":"calm","dramatic":"dramatic"][$0]})
  guard counts.count<=1,styles.count<=1,!set.isDisjoint(with:["shots","shot","compositions","composition"]) else{throw NSError(domain:"Conflicting or missing brief",code:1)}
  let camp = !set.isDisjoint(with:["camp","campsite"])
  let frank=set.contains("frank"),van=set.contains("van")
  guard !(frank && van),!(camp && van),!van || set.contains("parked"),!set.contains("parked") || van, camp || van else{throw NSError(domain:"Unsupported subject",code:1)}
  plan=try LocalPlan(subject:frank ? "frank" : van ? "van" : "campsite",style:styles.first ?? "natural",count:counts.first ?? 3)
 }
 func matches(subject:String,style:String,count:Int)->Bool {
  plan.subject==subject && plan.style==style && plan.count==count
 }
}
extension LocalPlan {
 static func preserves(_ source:String,subject:String,style:String,count:Int)->Bool {
  (try? BriefContract(source).matches(subject:subject,style:style,count:count)) ?? false
 }
}
