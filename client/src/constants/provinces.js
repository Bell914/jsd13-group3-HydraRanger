export const THAI_PROVINCES = [
  "กรุงเทพมหานคร", "กระบี่", "กาญจนบุรี", "กาฬสินธุ์", "กำแพงเพชร", "ขอนแก่น", "จันทบุรี", "ฉะเชิงเทรา", "ชลบุรี", "ชัยนาท", "ชัยภูมิ", "ชุมพร", "เชียงราย", "เชียงใหม่", "ตรัง", "ตราด", "ตาก", "นครนายก", "นครปฐม", "นครพนม", "นครราชสีมา", "นครศรีธรรมราช", "นครสวรรค์", "นนทบุรี", "นราธิวาส", "น่าน", "บึงกาฬ", "บุรีรัมย์", "ปทุมธานี", "ประจวบคีรีขันธ์", "ปราจีนบุรี", "ปัตตานี", "พระนครศรีอยุธยา", "พะเยา", "พังงา", "พัทลุง", "พิจิตร", "พิษณุโลก", "เพชรบุรี", "เพชรบูรณ์", "แพร่", "ภูเก็ต", "มหาสารคาม", "มุกดาหาร", "แม่ฮ่องสอน", "ยโสธร", "ยะลา", "ร้อยเอ็ด", "ระนอง", "ระยอง", "ราชบุรี", "ลพบุรี", "ลำปาง", "ลำพูน", "เลย", "ศรีสะเกษ", "สกลนคร", "สงขลา", "สตูล", "สมุทรปราการ", "สมุทรสงคราม", "สมุทรสาคร", "สระแก้ว", "สระบุรี", "สิงห์บุรี", "สุโขทัย", "สุพรรณบุรี", "สุราษฎร์ธานี", "สุรินทร์", "หนองคาย", "หนองบัวลำภู", "อ่างทอง", "อำนาจเจริญ", "อุดรธานี", "อุตรดิตถ์", "อุทัยธานี", "อุบลราชธานี",
];

const PROVINCE_ALIASES = new Map([
  ["bangkok", "กรุงเทพมหานคร"], ["bangkok city", "กรุงเทพมหานคร"], ["krung thep maha nakhon", "กรุงเทพมหานคร"],
  ["krabi", "กระบี่"], ["kanchanaburi", "กาญจนบุรี"], ["kalasin", "กาฬสินธุ์"], ["kamphaeng phet", "กำแพงเพชร"],
  ["khon kaen", "ขอนแก่น"], ["chanthaburi", "จันทบุรี"], ["chachoengsao", "ฉะเชิงเทรา"], ["chon buri", "ชลบุรี"], ["chonburi", "ชลบุรี"],
  ["chai nat", "ชัยนาท"], ["chainat", "ชัยนาท"], ["chaiyaphum", "ชัยภูมิ"], ["chumphon", "ชุมพร"], ["chiang rai", "เชียงราย"], ["chiang mai", "เชียงใหม่"],
  ["trang", "ตรัง"], ["trat", "ตราด"], ["tak", "ตาก"], ["nakhon nayok", "นครนายก"], ["nakhon pathom", "นครปฐม"], ["nakhon phanom", "นครพนม"],
  ["nakhon ratchasima", "นครราชสีมา"], ["korat", "นครราชสีมา"], ["nakhon si thammarat", "นครศรีธรรมราช"], ["nakhon sawan", "นครสวรรค์"],
  ["nonthaburi", "นนทบุรี"], ["narathiwat", "นราธิวาส"], ["nan", "น่าน"], ["bueng kan", "บึงกาฬ"], ["buri ram", "บุรีรัมย์"], ["buriram", "บุรีรัมย์"],
  ["pathum thani", "ปทุมธานี"], ["prachuap khiri khan", "ประจวบคีรีขันธ์"], ["prachin buri", "ปราจีนบุรี"], ["prachinburi", "ปราจีนบุรี"],
  ["pattani", "ปัตตานี"], ["phra nakhon si ayutthaya", "พระนครศรีอยุธยา"], ["ayutthaya", "พระนครศรีอยุธยา"], ["phayao", "พะเยา"], ["phang nga", "พังงา"],
  ["phatthalung", "พัทลุง"], ["phichit", "พิจิตร"], ["phitsanulok", "พิษณุโลก"], ["phetchaburi", "เพชรบุรี"], ["phetchabun", "เพชรบูรณ์"],
  ["phrae", "แพร่"], ["phuket", "ภูเก็ต"], ["maha sarakham", "มหาสารคาม"], ["mukdahan", "มุกดาหาร"], ["mae hong son", "แม่ฮ่องสอน"],
  ["yasothon", "ยโสธร"], ["yala", "ยะลา"], ["roi et", "ร้อยเอ็ด"], ["ranong", "ระนอง"], ["rayong", "ระยอง"], ["ratchaburi", "ราชบุรี"],
  ["lop buri", "ลพบุรี"], ["lopburi", "ลพบุรี"], ["lampang", "ลำปาง"], ["lamphun", "ลำพูน"], ["loei", "เลย"], ["si sa ket", "ศรีสะเกษ"],
  ["sisaket", "ศรีสะเกษ"], ["sakon nakhon", "สกลนคร"], ["songkhla", "สงขลา"], ["satun", "สตูล"], ["samut prakan", "สมุทรปราการ"],
  ["samut songkhram", "สมุทรสงคราม"], ["samut sakhon", "สมุทรสาคร"], ["sa kaeo", "สระแก้ว"], ["saraburi", "สระบุรี"], ["sing buri", "สิงห์บุรี"],
  ["sukhothai", "สุโขทัย"], ["suphan buri", "สุพรรณบุรี"], ["surat thani", "สุราษฎร์ธานี"], ["surin", "สุรินทร์"], ["nong khai", "หนองคาย"],
  ["nong bua lamphu", "หนองบัวลำภู"], ["ang thong", "อ่างทอง"], ["amnat charoen", "อำนาจเจริญ"], ["udon thani", "อุดรธานี"],
  ["uttaradit", "อุตรดิตถ์"], ["uthai thani", "อุทัยธานี"], ["ubon ratchathani", "อุบลราชธานี"],
].map(([alias, province]) => [alias.trim().toLowerCase(), province]));

export function normalizeProvince(value) {
  const province = String(value ?? "").trim().replace(/\s+/g, " ");
  if (!province) return "";
  if (THAI_PROVINCES.includes(province)) return province;
  return PROVINCE_ALIASES.get(province.toLowerCase()) || province;
}
