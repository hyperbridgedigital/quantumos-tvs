// Delivery partners + zones — TheValueStore (ST001, ST004, ST005)
export const deliveryPartners = [
  { id:'DP001', name:'Karthik M.', phone:'+91 98400 10001', store:'ST001', status:'available', vehicle:'bike', avgTime:22, rating:4.7, orders:148, today:3 },
  { id:'DP002', name:'Suresh K.', phone:'+91 98400 10002', store:'ST001', status:'delivering', vehicle:'bike', avgTime:25, rating:4.5, orders:132, today:4 },
  { id:'DP003', name:'Ravi T.', phone:'+91 98400 10003', store:'ST001', status:'available', vehicle:'bike', avgTime:20, rating:4.8, orders:165, today:2 },
  { id:'DP004', name:'Vijay L.', phone:'+91 98400 10010', store:'ST001', status:'available', vehicle:'bike', avgTime:26, rating:4.3, orders:43, today:0 },
  { id:'DP005', name:'Dinesh R.', phone:'+91 98400 10004', store:'ST004', status:'available', vehicle:'bike', avgTime:23, rating:4.6, orders:98, today:3 },
  { id:'DP006', name:'Pradeep S.', phone:'+91 98400 10005', store:'ST004', status:'available', vehicle:'bike', avgTime:24, rating:4.4, orders:87, today:2 },
  { id:'DP007', name:'Gopal V.', phone:'+91 98400 10006', store:'ST004', status:'available', vehicle:'bike', avgTime:21, rating:4.7, orders:110, today:1 },
  { id:'DP008', name:'Farhan A.', phone:'+91 98400 10007', store:'ST005', status:'available', vehicle:'bike', avgTime:18, rating:4.8, orders:75, today:4 },
  { id:'DP009', name:'Balaji N.', phone:'+91 98400 10008', store:'ST005', status:'available', vehicle:'bike', avgTime:19, rating:4.5, orders:62, today:3 },
];

export const deliveryZones = [
  { id:'ZC001', name:'Mount Road / Anna Salai', store:'ST001', fee:30, eta:20, active:true, minOrder:149, freeAbove:499 },
  { id:'ZC002', name:'Adyar / Thiruvanmiyur', store:'ST001', fee:35, eta:25, active:true, minOrder:149, freeAbove:499 },
  { id:'ZC003', name:'Velachery / OMR', store:'ST004', fee:35, eta:25, active:true, minOrder:149, freeAbove:499 },
  { id:'ZC004', name:'100 Feet Road / Perungudi', store:'ST005', fee:35, eta:25, active:true, minOrder:149, freeAbove:499 },
];
