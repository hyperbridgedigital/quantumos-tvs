// Geo Database — v11.1.0
export const geoDb = {
  stores: [
    { storeId:'ST001', gmb:{ placeId:'ChIJ_ECR', businessName:'Mount Road Sangam', category:'Restaurant', phone:'+91 44 4500 1234', website:'https://charminarmehfil.com', hours:'11:00-23:30', attributes:['dine_in','takeout','delivery'] }, nap:{ name:'Mount Road Sangam', address:'281, East Coast Rd, Akkarai, Chennai 600119', phone:'+91 44 4500 1234' }, reviews:{ count:342, avg:4.3 } },
    { storeId:'ST002', gmb:{ placeId:'ChIJ_ECR', businessName:'Charminar Mehfil', category:'Restaurant', phone:'+91 44 4500 5678', website:'https://charminarmehfil.com', hours:'11:00-23:30', attributes:['dine_in','takeout','delivery'] }, nap:{ name:'Charminar Mehfil', address:'281, East Coast Rd, Akkarai, Chennai 600119', phone:'+91 44 4500 5678' }, reviews:{ count:218, avg:4.2 } },
  ],
  areaLandingContent: {
    'ECR': { heading:'Charminar Mehfil in ECR', content:'Visit our flagship café at Thanikachalam Road for the best Signature Biryani in central Chennai.', offers:['WELCOME20'] },
    'ECR': { heading:'Mount Road Sangam on ECR', content:'Our premium restaurant on East Coast Road brings royal Signature dining to south Chennai.', offers:['ECR25'] },
  },
  geoFencing: [
    { storeId:'ST001', radiusKm:5, lat:13.0418, lng:80.2341, message:'You are near Mount Road Sangam!' },
    { storeId:'ST002', radiusKm:5, lat:12.8996, lng:80.2460, message:'You are near Mount Road Sangam ECR!' },
  ],
  languageToggle: { default:'en', available:['en','ta'] },
};
