// Geo Database — v11.1.0 — TheValueStore
export const geoDb = {
  stores: [
    { storeId:'ST001', gmb:{ placeId:'ChIJ_ECR', businessName:'TheValueStore ECR', category:'Electronics Store', phone:'+91 44 4500 1234', website:'https://thevaluestore.com', hours:'10:00-21:00', attributes:['pickup','delivery','online'] }, nap:{ name:'TheValueStore ECR', address:'281, East Coast Rd, Akkarai, Chennai 600119', phone:'+91 44 4500 1234' }, reviews:{ count:342, avg:4.3 } },
    { storeId:'ST002', gmb:{ placeId:'ChIJ_TNagar', businessName:'TheValueStore T. Nagar', category:'Electronics Store', phone:'+91 44 4500 5678', website:'https://thevaluestore.com', hours:'10:00-21:00', attributes:['pickup','delivery','online'] }, nap:{ name:'TheValueStore T. Nagar', address:'1, Thanikachalam Rd, T. Nagar, Chennai 600017', phone:'+91 44 4500 5678' }, reviews:{ count:218, avg:4.2 } },
    { storeId:'ST003', gmb:{ placeId:'ChIJ_MountRoad', businessName:'TheValueStore Mount Road', category:'Electronics Store', phone:'+91 44 4500 9012', website:'https://thevaluestore.com', hours:'10:00-21:00', attributes:['pickup','delivery','online'] }, nap:{ name:'TheValueStore Mount Road', address:'12, Anna Salai, Mount Road, Chennai 600002', phone:'+91 44 4500 9012' }, reviews:{ count:180, avg:4.4 } },
  ],
  areaLandingContent: {
    'ECR': { heading:'TheValueStore in ECR', content:'Visit our flagship store for gaming PCs, laptops & Build Your PC. Best value in south Chennai.', offers:['WELCOME20'] },
    'T. Nagar': { heading:'TheValueStore T. Nagar', content:'Central Chennai — gaming rigs, laptops & full tech support.', offers:['GAMING50'] },
    'Mount Road': { heading:'TheValueStore Mount Road', content:'Anna Salai — quick pickup, delivery & Build Your PC.', offers:['BUILD100'] },
  },
  geoFencing: [
    { storeId:'ST001', radiusKm:5, lat:12.8996, lng:80.2460, message:'You are near TheValueStore ECR!' },
    { storeId:'ST002', radiusKm:5, lat:13.0418, lng:80.2341, message:'You are near TheValueStore T. Nagar!' },
    { storeId:'ST003', radiusKm:5, lat:13.0604, lng:80.2640, message:'You are near TheValueStore Mount Road!' },
  ],
  languageToggle: { default:'en', available:['en','ta'] },
};
