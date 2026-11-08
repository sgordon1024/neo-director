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

extension LocalPlan {
 static func preserves(_ source:String,subject:String,style:String,count:Int)->Bool {
  let words=source.lowercased().split{!$0.isLetter && !$0.isNumber}.map(String.init)
  let set=Set(words)
  if !set.isDisjoint(with:["fly","takeoff","land","follow","chase","driving","moving","launch","ignore","override"]){return false}
  if set.contains("frank") != (subject=="frank"){return false}
  if subject=="van" && !set.contains("parked"){return false}
  for (word,n) in ["two":2,"three":3,"four":4,"five":5,"2":2,"3":3,"4":4,"5":5] {if set.contains(word) && count != n{return false}}
  if (set.contains("calm") || set.contains("peaceful")) && style != "calm" {return false}
  if set.contains("dramatic") && style != "dramatic" {return false}
  return true
 }
}
