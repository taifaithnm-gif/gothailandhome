-- Seed reference data + 12 published placeholder properties

insert into public.locations (
  id, slug, name_en, name_zh, name_th, city_en, city_zh, city_th, province_en, province_zh, province_th
) values
  ('11111111-1111-4111-8111-111111111101', 'riverside-bangkok', 'Riverside, Bangkok', '曼谷河畔', 'ริมน้ำ กรุงเทพฯ', 'Bangkok', '曼谷', 'กรุงเทพฯ', 'Bangkok', '曼谷', 'กรุงเทพมหานคร'),
  ('11111111-1111-4111-8111-111111111102', 'sukhumvit-bangkok', 'Sukhumvit, Bangkok', '曼谷素坤逸', 'สุขุมวิท กรุงเทพฯ', 'Bangkok', '曼谷', 'กรุงเทพฯ', 'Bangkok', '曼谷', 'กรุงเทพมหานคร'),
  ('11111111-1111-4111-8111-111111111103', 'cherngtalay-phuket', 'Cherngtalay, Phuket', '普吉岛诚泰莱', 'เชิงทะเล ภูเก็ต', 'Phuket', '普吉', 'ภูเก็ต', 'Phuket', '普吉', 'ภูเก็ต'),
  ('11111111-1111-4111-8111-111111111104', 'nimman-chiang-mai', 'Nimman, Chiang Mai', '清迈宁曼', 'นิมมาน เชียงใหม่', 'Chiang Mai', '清迈', 'เชียงใหม่', 'Chiang Mai', '清迈', 'เชียงใหม่'),
  ('11111111-1111-4111-8111-111111111105', 'hua-hin', 'Hua Hin', '华欣', 'หัวหิน', 'Hua Hin', '华欣', 'หัวหิน', 'Prachuap Khiri Khan', '巴蜀府', 'ประจวบคีรีขันธ์'),
  ('11111111-1111-4111-8111-111111111106', 'wongamat-pattaya', 'Wongamat, Pattaya', '芭提雅翁阿玛', 'วงศ์อมาตย์ พัทยา', 'Pattaya', '芭提雅', 'พัทยา', 'Chonburi', '春武里', 'ชลบุรี'),
  ('11111111-1111-4111-8111-111111111107', 'silom-bangkok', 'Silom, Bangkok', '曼谷是隆', 'สีลม กรุงเทพฯ', 'Bangkok', '曼谷', 'กรุงเทพฯ', 'Bangkok', '曼谷', 'กรุงเทพมหานคร'),
  ('11111111-1111-4111-8111-111111111108', 'bangtao-phuket', 'Bang Tao, Phuket', '普吉邦涛', 'บางเทา ภูเก็ต', 'Phuket', '普吉', 'ภูเก็ต', 'Phuket', '普吉', 'ภูเก็ต');

insert into public.developers (id, slug, name_en, name_zh, name_th, website) values
  ('22222222-2222-4222-8222-222222222201', 'sathorn-living', 'Sathorn Living', '沙吞生活', 'สาทร ลิฟวิ่ง', 'https://example.com/sathorn'),
  ('22222222-2222-4222-8222-222222222202', 'andaman-homes', 'Andaman Homes', '安达曼家园', 'อันดามัน โฮมส์', 'https://example.com/andaman'),
  ('22222222-2222-4222-8222-222222222203', 'northern-estate', 'Northern Estate', '北部地产', 'นอร์ทเทิร์น เอสเตท', 'https://example.com/northern');

insert into public.agents (id, slug, name_en, name_zh, name_th, email, phone, bio_en, bio_zh, bio_th) values
  ('33333333-3333-4333-8333-333333333301', 'anya-chen', 'Anya Chen', '陈安雅', 'อัญญา เฉิน', 'anya@gothailandhome.com', '+66 81 000 0001', 'Bangkok and coastal specialist.', '专注曼谷与海滨物业。', 'เชี่ยวชาญกรุงเทพฯ และทำเลชายฝั่ง'),
  ('33333333-3333-4333-8333-333333333302', 'somchai-wong', 'Somchai Wong', '王松猜', 'สมชาย วงศ์', 'somchai@gothailandhome.com', '+66 81 000 0002', 'Phuket villa advisor.', '普吉别墅顾问。', 'ที่ปรึกษาวิลล่าภูเก็ต');

insert into public.property_projects (
  id, developer_id, location_id, slug, name_en, name_zh, name_th, description_en, description_zh, description_th
) values
  (
    '44444444-4444-4444-8444-444444444401',
    '22222222-2222-4222-8222-222222222201',
    '11111111-1111-4111-8111-111111111101',
    'river-horizon',
    'River Horizon',
    '河际',
    'ริเวอร์ ฮอไรซอน',
    'Riverside condo project with transit access.',
    '交通便利的河畔公寓项目。',
    'โครงการคอนโดริมน้ำเดินทางสะดวก'
  ),
  (
    '44444444-4444-4444-8444-444444444402',
    '22222222-2222-4222-8222-222222222202',
    '11111111-1111-4111-8111-111111111103',
    'lagoon-leaf',
    'Lagoon Leaf',
    '泻湖叶',
    'ลากูน ลีฟ',
    'Low-density villas near lagoons and beaches.',
    '靠近泻湖与海滩的低密度别墅。',
    'วิลล่าความหนาแน่นต่ำใกล้ลากูนและชายหาด'
  );

insert into public.properties (
  id, slug, status, listing_type, property_type, project_id, location_id, agent_id,
  price_thb, bedrooms, bathrooms, area_sqm, land_area_sqm,
  title_en, title_zh, title_th, summary_en, summary_zh, summary_th,
  description_en, description_zh, description_th, featured, published_at
) values
(
  '55555555-5555-4555-8555-555555555501',
  'bangkok-riverside-condo',
  'published', 'sale', 'condo',
  '44444444-4444-4444-8444-444444444401',
  '11111111-1111-4111-8111-111111111101',
  '33333333-3333-4333-8333-333333333301',
  8900000, 2, 2, 78, null,
  'Riverside Condo with City View', '河景城市景观公寓', 'คอนโดริมน้ำวิวเมือง',
  'Modern 2-bedroom condo near BTS with river views.', '紧邻 BTS 的现代化两居室公寓，享有河景。', 'คอนโด 2 ห้องนอนทันสมัยใกล้ BTS พร้อมวิวแม่น้ำ',
  'Published riverside condominium listing for Bangkok buyers seeking transit convenience and water views.',
  '适合重视交通与河景的曼谷买家的河畔公寓房源。',
  'ประกาศคอนโดริมน้ำสำหรับผู้ซื้อในกรุงเทพฯ ที่ต้องการความสะดวกในการเดินทางและวิวน้ำ',
  true, now()
),
(
  '55555555-5555-4555-8555-555555555502',
  'phuket-pool-villa',
  'published', 'sale', 'villa',
  '44444444-4444-4444-8444-444444444402',
  '11111111-1111-4111-8111-111111111103',
  '33333333-3333-4333-8333-333333333302',
  18500000, 3, 3, 220, 480,
  'Pool Villa Near the Beach', '近海滩私人泳池别墅', 'พูลวิลล่าใกล้ชายหาด',
  'Private pool villa with tropical garden and guest pavilion.', '带私人泳池、热带花园与客房的别墅。', 'วิลล่าสระว่ายน้ำส่วนตัวพร้อมสวนเขตร้อนและศาลาแขก',
  'Spacious Phuket villa suited for long stays or holiday use with outdoor living spaces.',
  '适合长住或度假的宽敞普吉别墅，含户外生活空间。',
  'วิลล่าภูเก็ตสำหรับพักระยะยาวหรือวันหยุดพร้อมพื้นที่ใช้ชีวิตกลางแจ้ง',
  true, now()
),
(
  '55555555-5555-4555-8555-555555555503',
  'chiang-mai-garden-house',
  'published', 'sale', 'house',
  null,
  '11111111-1111-4111-8111-111111111104',
  '33333333-3333-4333-8333-333333333301',
  6200000, 3, 2, 160, 220,
  'Quiet Garden House near Nimman', '宁曼附近安静花园别墅', 'บ้านสวนเงียบใกล้นิมมาน',
  'Family-friendly house close to cafes and schools.', '靠近咖啡馆与学校的家庭友好型住宅。', 'บ้านเหมาะกับครอบครัวใกล้คาเฟ่และโรงเรียน',
  'Detached house with parking and a compact courtyard in Chiang Mai.',
  '清迈独立屋，含车位与小庭院。',
  'บ้านเดี่ยวในเชียงใหม่พร้อมที่จอดรถและลานเล็ก',
  true, now()
),
(
  '55555555-5555-4555-8555-555555555504',
  'hua-hin-beach-house',
  'published', 'sale', 'house',
  null,
  '11111111-1111-4111-8111-111111111105',
  '33333333-3333-4333-8333-333333333302',
  12800000, 4, 3, 240, 360,
  'Beach House for Weekend Escapes', '周末度假海滩别墅', 'บ้านใกล้หาดสำหรับวันหยุดสุดสัปดาห์',
  'Spacious house within short drive of the shoreline.', '离海岸车程较短的宽敞别墅。', 'บ้านกว้างขวางขับรถไม่ไกลจากชายฝั่ง',
  'Hua Hin house with outdoor dining space and garden for weekend use.',
  '华欣住宅，含户外用餐区与花园，适合周末使用。',
  'บ้านหัวหินพร้อมพื้นที่รับประทานอาหารกลางแจ้งและสวนสำหรับวันหยุด',
  false, now()
),
(
  '55555555-5555-4555-8555-555555555505',
  'pattaya-sea-view-condo',
  'published', 'sale', 'condo',
  null,
  '11111111-1111-4111-8111-111111111106',
  '33333333-3333-4333-8333-333333333301',
  3900000, 1, 1, 45, null,
  'Sea-View Studio Condo', '海景开间公寓', 'คอนโดสตูดิโอวิวทะเล',
  'Compact investment condo with balcony sea breeze.', '紧凑型投资公寓，阳台可享海风。', 'คอนโดลงทุนขนาดกะทัดรัดพร้อมระเบียงรับลมทะเล',
  'Investment-oriented condo listing in Pattaya with sea-facing balcony.',
  '芭提雅投资型公寓，带朝海阳台。',
  'คอนโดลงทุนในพัทยาพร้อมระเบียงหันทะเล',
  false, now()
),
(
  '55555555-5555-4555-8555-555555555506',
  'bangkok-sukhumvit-condo',
  'published', 'rent', 'condo',
  null,
  '11111111-1111-4111-8111-111111111102',
  '33333333-3333-4333-8333-333333333301',
  45000, 1, 1, 52, null,
  'Sukhumvit Transit Condo', '素坤逸交通便利公寓', 'คอนโดสุขุมวิทใกล้รถไฟฟ้า',
  'One-bedroom condo beside shopping and transit links.', '紧邻购物与交通枢纽的一居室公寓。', 'คอนโด 1 ห้องนอนใกล้อาคารช้อปปิ้งและการเดินทาง',
  'Monthly rental condo on the Sukhumvit corridor for corporate assignees.',
  '素坤逸走廊月租公寓，适合外派人士。',
  'คอนโดให้เช่ารายเดือนย่านสุขุมวิทสำหรับพนักงานบริษัท',
  true, now()
),
(
  '55555555-5555-4555-8555-555555555507',
  'silom-office-floor',
  'published', 'rent', 'commercial',
  null,
  '11111111-1111-4111-8111-111111111107',
  '33333333-3333-4333-8333-333333333301',
  180000, null, 2, 320, null,
  'Fitted Office Floor in Silom', '是隆精装办公楼层', 'พื้นสำนักงานพร้อมใช้ที่ย่านสีลม',
  'Open-plan commercial floor with meeting rooms.', '带会议室的开放式商业楼层。', 'พื้นเชิงพาณิชย์แบบโล่งพร้อมห้องประชุม',
  'Commercial office floor suited for regional teams needing central Bangkok access.',
  '适合需要曼谷市中心办公的区域团队的商业楼层。',
  'พื้นที่สำนักงานเชิงพาณิชย์สำหรับทีมที่ต้องการอยู่ใจกลางกรุงเทพฯ',
  false, now()
),
(
  '55555555-5555-4555-8555-555555555508',
  'bangtao-land-plot',
  'published', 'sale', 'land',
  null,
  '11111111-1111-4111-8111-111111111108',
  '33333333-3333-4333-8333-333333333302',
  24500000, null, null, null, 1600,
  'Bang Tao Development Land', '邦涛开发用地', 'ที่ดินพัฒนาบางเทา',
  'Rectangular land plot near Bang Tao lifestyle corridor.', '靠近邦涛生活廊道的规整地块。', 'ที่ดินรูปสี่เหลี่ยมใกล้แนวไลฟ์สไตล์บางเทา',
  'Land opportunity for villa or boutique hospitality development in Phuket.',
  '普吉可用于别墅或精品酒店开发的土地机会。',
  'โอกาสที่ดินสำหรับพัฒนาวิลล่าหรือโฮสพิทาลิตี้ขนาดเล็กในภูเก็ต',
  false, now()
),
(
  '55555555-5555-4555-8555-555555555509',
  'riverside-family-condo',
  'published', 'sale', 'condo',
  '44444444-4444-4444-8444-444444444401',
  '11111111-1111-4111-8111-111111111101',
  '33333333-3333-4333-8333-333333333301',
  11200000, 3, 2, 105, null,
  'Family Riverside Condo', '河畔家庭公寓', 'คอนโดริมน้ำสำหรับครอบครัว',
  'Corner 3-bedroom condo with dual aspect light.', '双面采光的三居室转角公寓。', 'คอนโดมุม 3 ห้องนอนรับแสงสองด้าน',
  'Larger riverside unit for families wanting space and amenities.',
  '适合家庭的更大面积河畔单位，配套齐全。',
  'ยูนิตริมน้ำขนาดใหญ่สำหรับครอบครัวที่ต้องการพื้นที่และสิ่งอำนวยความสะดวก',
  false, now()
),
(
  '55555555-5555-4555-8555-555555555510',
  'phuket-hillside-villa-rent',
  'published', 'rent', 'villa',
  '44444444-4444-4444-8444-444444444402',
  '11111111-1111-4111-8111-111111111103',
  '33333333-3333-4333-8333-333333333302',
  150000, 4, 4, 280, 600,
  'Hillside Villa Monthly Rental', '山坡别墅月租', 'วิลล่าบนเนินให้เช่ารายเดือน',
  'Furnished villa with infinity pool and staff room.', '带无边泳池与员工房的精装别墅。', 'วิลล่าตกแต่งพร้อมสระอินฟินิตี้และห้องพนักงาน',
  'Turnkey Phuket rental villa for executives and relocating families.',
  '适合高管与家庭搬迁的普吉即住型出租别墅。',
  'วิลล่าให้เช่าพร้อมอยู่สำหรับผู้บริหารและครอบครัวที่ย้ายถิ่น',
  true, now()
),
(
  '55555555-5555-4555-8555-555555555511',
  'chiang-mai-cafe-commercial',
  'published', 'sale', 'commercial',
  null,
  '11111111-1111-4111-8111-111111111104',
  '33333333-3333-4333-8333-333333333301',
  9800000, null, 2, 140, 180,
  'Corner Cafe Commercial Unit', '转角咖啡馆商铺', 'ยูนิตเชิงพาณิชย์ร้านคาเฟ่มุม',
  'Street-front commercial unit with kitchen prep area.', '带后厨的临街商铺。', 'ยูนิตเชิงพาณิชย์หน้าถนนพร้อมโซนครัว',
  'Retail shell for F&B use near Nimman foot traffic.',
  '靠近宁曼客流、可用于餐饮的零售外壳。',
  'พื้นที่ค้าปลีกใกล้นิมมานสำหรับธุรกิจอาหารและเครื่องดื่ม',
  false, now()
),
(
  '55555555-5555-4555-8555-555555555512',
  'hua-hin-land-near-golf',
  'published', 'sale', 'land',
  null,
  '11111111-1111-4111-8111-111111111105',
  '33333333-3333-4333-8333-333333333302',
  7600000, null, null, null, 920,
  'Hua Hin Land near Golf Clubs', '华欣近高尔夫用地', 'ที่ดินหัวหินใกล้สนามกอล์ฟ',
  'Quiet land parcel with road access and utilities nearby.', '临近道路与市政设施的安静地块。', 'ที่ดินเงียบพร้อมทางเข้าและสาธารณูปโภคใกล้เคียง',
  'Build-ready plot for a weekend house or small compound.',
  '可用于周末住宅或小型庄园的可建地。',
  'ที่ดินพร้อมสร้างบ้านพักสุดสัปดาห์หรือคอมพาวด์ขนาดเล็ก',
  false, now()
);

insert into public.property_features (property_id, feature_key, label_en, label_zh, label_th, value_en, value_zh, value_th)
select p.id, f.feature_key, f.label_en, f.label_zh, f.label_th, f.value_en, f.value_zh, f.value_th
from (
  values
    ('bangkok-riverside-condo', 'transit', 'Transit', '交通', 'การเดินทาง', 'BTS nearby', '靠近 BTS', 'ใกล้ BTS'),
    ('bangkok-riverside-condo', 'view', 'View', '景观', 'วิว', 'River view', '河景', 'วิวแม่น้ำ'),
    ('phuket-pool-villa', 'pool', 'Pool', '泳池', 'สระว่ายน้ำ', 'Private pool', '私人泳池', 'สระส่วนตัว'),
    ('phuket-pool-villa', 'garden', 'Garden', '花园', 'สวน', 'Tropical garden', '热带花园', 'สวนเขตร้อน'),
    ('bangkok-sukhumvit-condo', 'furnishing', 'Furnishing', '家具', 'เฟอร์นิเจอร์', 'Fully furnished', '全装', 'ตกแต่งครบ'),
    ('silom-office-floor', 'fitout', 'Fit-out', '装修', 'การตกแต่ง', 'Partly fitted', '部分精装', 'ติดตั้งบางส่วน'),
    ('bangtao-land-plot', 'zoning', 'Use', '用途', 'การใช้งาน', 'Residential potential', '住宅潜力', 'ศักยภาพที่อยู่อาศัย')
) as f(slug, feature_key, label_en, label_zh, label_th, value_en, value_zh, value_th)
join public.properties p on p.slug = f.slug;
