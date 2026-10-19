export type Stage = '询盘' | '报价中' | '协商中' | '待确认' | '执行中' | '已完成'
export type Direction = 'inbound' | 'outbound'

export interface Customer {
  id: string
  name: string
  shortName: string
  country: string
  countryCode: string
  contact: string
  email: string
  owner: string
  color: string
  since: string
  tags: string[]
}

export interface OrderEvent {
  id: string
  date: string
  title: string
  detail: string
  kind: 'mail' | 'system' | 'note'
  emailId?: string
}

export interface Order {
  id: string
  customerId: string
  title: string
  product: string
  quantity: string
  amount: string
  stage: Stage
  owner: string
  updatedAt: string
  nextAction: string
  dueDate: string
  reference: string
  summary: string
  confidence: '已核实' | 'AI 建议'
  events: OrderEvent[]
}

export interface Email {
  id: string
  customerId: string
  orderId?: string
  direction: Direction
  sender: string
  recipient: string
  subject: string
  date: string
  time: string
  preview: string
  body: string
  attachments: string[]
  extracted: string[]
  unread?: boolean
}

export interface Review {
  id: string
  emailId: string
  customerId: string
  reason: string
  candidates: string[]
  selectedOrderId: string
}

export const stages: Stage[] = ['询盘', '报价中', '协商中', '待确认', '执行中', '已完成']

export const customers: Customer[] = [
  { id: 'c1', name: 'Northstar Home Inc.', shortName: 'NH', country: '美国', countryCode: 'US', contact: 'Emma Wilson', email: 'emma@northstarhome.com', owner: '林悦', color: 'blue', since: '2023-04', tags: ['重点客户', '家居'] },
  { id: 'c2', name: 'Belle Maison SAS', shortName: 'BM', country: '法国', countryCode: 'FR', contact: 'Camille Laurent', email: 'camille@bellemaison.fr', owner: '陈舟', color: 'rose', since: '2024-01', tags: ['复购客户', '家纺'] },
  { id: 'c3', name: 'Pacific Trade Co.', shortName: 'PT', country: '澳大利亚', countryCode: 'AU', contact: 'Oliver Chen', email: 'oliver@pacifictrade.au', owner: '林悦', color: 'teal', since: '2025-03', tags: ['渠道商'] },
  { id: 'c4', name: 'Osaka Living Ltd.', shortName: 'OL', country: '日本', countryCode: 'JP', contact: 'Haruka Sato', email: 'sato@osakaliving.jp', owner: '周宁', color: 'violet', since: '2024-08', tags: ['长期合作'] },
  { id: 'c5', name: 'Aria Textiles GmbH', shortName: 'AT', country: '德国', countryCode: 'DE', contact: 'Lukas Müller', email: 'lukas@ariatextiles.de', owner: '陈舟', color: 'amber', since: '2026-07', tags: ['新客户'] },
  { id: 'c6', name: 'Riverton Imports', shortName: 'RI', country: '加拿大', countryCode: 'CA', contact: 'Sophie Martin', email: 'sophie@riverton.ca', owner: '周宁', color: 'indigo', since: '2025-11', tags: ['复购客户'] },
]

export const initialOrders: Order[] = [
  {
    id: 'o1', customerId: 'c1', title: '秋冬陶瓷餐具补货', product: '陶瓷餐具套装', quantity: '2,400 套', amount: 'US$ 38,400', stage: '协商中', owner: '林悦', updatedAt: '2026-10-19', nextAction: '确认调整后的单价与交期', dueDate: '今天', reference: 'NS-PO-2026-18', confidence: 'AI 建议',
    summary: '客户希望把本次补货数量增至 2,400 套，并询问调整单价及最早发货日期。',
    events: [
      { id: 'ev11', date: '10月19日 09:42', title: '客户提出数量与价格调整', detail: '希望增加至 2,400 套，并确认新的单价与交期。', kind: 'mail', emailId: 'm1' },
      { id: 'ev12', date: '10月16日 15:20', title: '我方发送初版报价', detail: '按 2,000 套报价，交期为确认订单后 35 天。', kind: 'mail', emailId: 'm5' },
      { id: 'ev13', date: '10月14日 11:08', title: '收到复购询盘', detail: '客户询问秋冬餐具系列补货计划。', kind: 'mail', emailId: 'm9' },
    ],
  },
  {
    id: 'o2', customerId: 'c1', title: '春季餐具首批订单', product: '陶瓷餐具套装', quantity: '1,600 套', amount: 'US$ 25,600', stage: '已完成', owner: '林悦', updatedAt: '2026-06-18', nextAction: '无', dueDate: '—', reference: 'NS-PO-2026-05', confidence: '已核实',
    summary: '首批订单已完成并确认收货。本次秋冬补货作为独立订单跟进。',
    events: [
      { id: 'ev21', date: '6月18日', title: '客户确认收货', detail: '首批餐具已完成交付。', kind: 'mail' },
      { id: 'ev22', date: '4月09日', title: '订单确认', detail: '双方确认数量、价格和交期。', kind: 'mail' },
    ],
  },
  {
    id: 'o3', customerId: 'c2', title: '酒店布草采购计划', product: '纯棉床品四件套', quantity: '3,000 套', amount: 'US$ 72,000', stage: '待确认', owner: '陈舟', updatedAt: '2026-10-18', nextAction: '跟进客户签回 PI', dueDate: '明天', reference: 'BM-PO-0826', confidence: '已核实',
    summary: '样品与价格已获客户认可，PI 已发送，等待客户签回。',
    events: [
      { id: 'ev31', date: '10月18日 16:10', title: '我方发送形式发票', detail: '已发送 PI 与最终规格清单。', kind: 'mail', emailId: 'm3' },
      { id: 'ev32', date: '10月15日 10:30', title: '客户确认样品', detail: '面料与包装方案通过。', kind: 'mail' },
    ],
  },
  {
    id: 'o4', customerId: 'c3', title: '户外折叠椅首单', product: '户外折叠椅', quantity: '1,200 把', amount: '待报价', stage: '报价中', owner: '林悦', updatedAt: '2026-10-17', nextAction: '发送 FOB 报价与装柜量', dueDate: '今天', reference: 'PT-REQ-1017', confidence: 'AI 建议',
    summary: '客户正在比较多家供应商，需要 FOB 报价、起订量和每柜装载数量。',
    events: [
      { id: 'ev41', date: '10月17日 14:25', title: '收到新询价', detail: '询问三种颜色折叠椅的价格及装柜量。', kind: 'mail', emailId: 'm6' },
    ],
  },
  {
    id: 'o5', customerId: 'c4', title: '木质收纳架追加订单', product: '木质收纳架', quantity: '800 件', amount: 'US$ 19,200', stage: '执行中', owner: '周宁', updatedAt: '2026-10-18', nextAction: '更新包装打样照片', dueDate: '10月21日', reference: 'OL-2026-094', confidence: '已核实',
    summary: '追加订单已确认，正在安排包装打样与生产。',
    events: [
      { id: 'ev51', date: '10月18日 12:04', title: '确认包装要求', detail: '客户要求在外箱增加日文标识。', kind: 'mail', emailId: 'm4' },
      { id: 'ev52', date: '10月11日 09:18', title: '订单确认', detail: '确认 800 件追加订单。', kind: 'mail' },
    ],
  },
  {
    id: 'o6', customerId: 'c5', title: '有机棉面料询盘', product: '有机棉面料', quantity: '5,000 米', amount: '待报价', stage: '询盘', owner: '陈舟', updatedAt: '2026-10-19', nextAction: '确认克重和认证要求', dueDate: '今天', reference: 'AT-INQ-1019', confidence: 'AI 建议',
    summary: '新客户询问有机棉面料。克重、认证及目标交期尚待确认。',
    events: [
      { id: 'ev61', date: '10月19日 08:55', title: '收到新询盘', detail: '询问 5,000 米有机棉面料及认证文件。', kind: 'mail', emailId: 'm2' },
    ],
  },
  {
    id: 'o7', customerId: 'c6', title: '圣诞礼品包装盒', product: '礼品包装盒', quantity: '10,000 个', amount: 'US$ 15,800', stage: '执行中', owner: '周宁', updatedAt: '2026-10-16', nextAction: '确认出货前检验时间', dueDate: '10月22日', reference: 'RI-PO-2210', confidence: '已核实',
    summary: '生产已完成大部分，等待确认出货前检验安排。',
    events: [
      { id: 'ev71', date: '10月16日 17:03', title: '生产进度更新', detail: '工厂预计 10月25日完成全部包装。', kind: 'mail', emailId: 'm7' },
    ],
  },
  {
    id: 'o8', customerId: 'c2', title: '夏季桌布订单', product: '亚麻桌布', quantity: '1,500 件', amount: 'US$ 12,600', stage: '已完成', owner: '陈舟', updatedAt: '2026-08-20', nextAction: '无', dueDate: '—', reference: 'BM-PO-0426', confidence: '已核实',
    summary: '夏季桌布订单已交付，客户随后提出酒店布草采购需求。',
    events: [
      { id: 'ev81', date: '8月20日', title: '订单完成', detail: '客户确认已收到全部货物。', kind: 'mail' },
    ],
  },
  {
    id: 'o9', customerId: 'c6', title: '冬季礼盒新企划', product: '磁吸礼盒', quantity: '6,000 个', amount: '待报价', stage: '询盘', owner: '周宁', updatedAt: '2026-10-18', nextAction: '核对设计稿及工艺', dueDate: '明天', reference: 'RI-INQ-1018', confidence: 'AI 建议',
    summary: '客户提出另一款礼盒的新需求，正在确认设计稿。与现有圣诞包装盒订单分开跟进。',
    events: [
      { id: 'ev91', date: '10月18日 10:15', title: '收到新产品需求', detail: '客户询问磁吸礼盒的定制可行性。', kind: 'mail', emailId: 'm8' },
    ],
  },
]

export const emails: Email[] = [
  { id: 'm1', customerId: 'c1', orderId: 'o1', direction: 'inbound', sender: 'Emma Wilson <emma@northstarhome.com>', recipient: 'sales@company.com', subject: 'Re: Autumn dinnerware restock — quantity update', date: '2026-10-19', time: '09:42', preview: 'Could we increase the quantity to 2,400 sets? Please advise your best price and earliest shipment date.', body: 'Hi Lynn,\n\nThanks for the quotation. Our autumn promotion is doing well, so could we increase the quantity to 2,400 sets? Please advise your best price for the revised quantity and the earliest shipment date.\n\nWe would like to keep the same glaze and packaging as our previous order.\n\nBest regards,\nEmma', attachments: [], extracted: ['数量调整：2,000 → 2,400 套', '询问新的单价与最早发货日期'], unread: true },
  { id: 'm2', customerId: 'c5', orderId: 'o6', direction: 'inbound', sender: 'Lukas Müller <lukas@ariatextiles.de>', recipient: 'sales@company.com', subject: 'Inquiry: organic cotton fabric for new collection', date: '2026-10-19', time: '08:55', preview: 'We are looking for approximately 5,000 meters of organic cotton fabric for our spring collection.', body: 'Dear team,\n\nWe are looking for approximately 5,000 meters of organic cotton fabric for our spring collection. Could you share available specifications, certifications and indicative pricing?\n\nOur team can provide the exact weight and finish requirements shortly.\n\nKind regards,\nLukas Müller', attachments: ['Fabric_Reference.pdf'], extracted: ['新客户询盘', '预计需求：5,000 米', '待确认：克重、认证要求'], unread: true },
  { id: 'm3', customerId: 'c2', orderId: 'o3', direction: 'outbound', sender: 'Chen Zhou <sales@company.com>', recipient: 'camille@bellemaison.fr', subject: 'PI for hotel bedding order BM-PO-0826', date: '2026-10-18', time: '16:10', preview: 'Please find attached the proforma invoice and final specifications for your review.', body: 'Dear Camille,\n\nPlease find attached the proforma invoice and the final specifications for the hotel bedding order. Kindly review and return the signed PI when convenient.\n\nBest regards,\nChen', attachments: ['PI_BM-PO-0826.pdf', 'Final_Specification.xlsx'], extracted: ['我方已发送 PI', '等待客户签回'] },
  { id: 'm4', customerId: 'c4', orderId: 'o5', direction: 'inbound', sender: 'Haruka Sato <sato@osakaliving.jp>', recipient: 'sales@company.com', subject: 'Re: Packaging details for OL-2026-094', date: '2026-10-18', time: '12:04', preview: 'Please add the Japanese item name and handling marks to the outer carton.', body: 'Dear Ning,\n\nThe sample looks good. Please add the Japanese item name and handling marks to the outer carton before mass production. Could you send us updated packaging photos?\n\nRegards,\nHaruka', attachments: ['Carton_Marks.pdf'], extracted: ['外箱增加日文品名及搬运标识', '需提供更新后的包装照片'] },
  { id: 'm5', customerId: 'c1', orderId: 'o1', direction: 'outbound', sender: 'Lin Yue <sales@company.com>', recipient: 'emma@northstarhome.com', subject: 'Quotation for autumn dinnerware restock', date: '2026-10-16', time: '15:20', preview: 'Attached is our quotation based on 2,000 sets, with a lead time of 35 days.', body: 'Hi Emma,\n\nAttached is the quotation based on 2,000 sets. The lead time is 35 days after order confirmation. Please let me know if you need any adjustments.\n\nBest,\nLynn', attachments: ['Quotation_NS_2026-18.pdf'], extracted: ['已报价：2,000 套', '预计交期：订单确认后 35 天'] },
  { id: 'm6', customerId: 'c3', orderId: 'o4', direction: 'inbound', sender: 'Oliver Chen <oliver@pacifictrade.au>', recipient: 'sales@company.com', subject: 'FOB quotation request — folding chairs', date: '2026-10-17', time: '14:25', preview: 'Please quote 1,200 outdoor folding chairs in three colors and advise container loading.', body: 'Hi,\n\nWe are sourcing 1,200 outdoor folding chairs in three colors. Please provide your FOB price, minimum order quantity and approximate container loading.\n\nThanks,\nOliver', attachments: ['Chair_Reference.jpg'], extracted: ['询价：1,200 把折叠椅', '需回复：FOB 价、MOQ、装柜量'] },
  { id: 'm7', customerId: 'c6', orderId: 'o7', direction: 'outbound', sender: 'Zhou Ning <sales@company.com>', recipient: 'sophie@riverton.ca', subject: 'Production update for RI-PO-2210', date: '2026-10-16', time: '17:03', preview: 'The packaging is on schedule and expected to finish by October 25.', body: 'Dear Sophie,\n\nThe packaging is on schedule and expected to finish by October 25. Please advise your preferred pre-shipment inspection date.\n\nBest regards,\nNing', attachments: [], extracted: ['预计完成包装：10月25日', '等待客户确认验货日期'] },
  { id: 'm8', customerId: 'c6', orderId: 'o9', direction: 'inbound', sender: 'Sophie Martin <sophie@riverton.ca>', recipient: 'sales@company.com', subject: 'New concept: magnetic gift boxes', date: '2026-10-18', time: '10:15', preview: 'We have another project for magnetic gift boxes. This is separate from the Christmas packaging order.', body: 'Hi Ning,\n\nWe have another project for magnetic gift boxes. This is separate from the Christmas packaging order. We expect around 6,000 pieces and will send the final artwork soon.\n\nCan your team advise feasibility and available finishes?\n\nThanks,\nSophie', attachments: ['Gift_Box_Concept.pdf'], extracted: ['新订单机会：磁吸礼盒约 6,000 个', '与圣诞包装盒订单分开'] },
  { id: 'm9', customerId: 'c1', orderId: 'o1', direction: 'inbound', sender: 'Emma Wilson <emma@northstarhome.com>', recipient: 'sales@company.com', subject: 'Autumn dinnerware restock', date: '2026-10-14', time: '11:08', preview: 'We would like to discuss another order for the autumn range.', body: 'Hi Lynn,\n\nWe would like to discuss another order for the autumn range. The spring collection was very well received. Could you send a quotation for 2,000 sets with the same finish?\n\nBest,\nEmma', attachments: [], extracted: ['复购询盘：秋冬餐具约 2,000 套'] },
  { id: 'm10', customerId: 'c2', direction: 'inbound', sender: 'Camille Laurent <camille@bellemaison.fr>', recipient: 'sales@company.com', subject: 'Re: Fabric color reference', date: '2026-10-18', time: '09:21', preview: 'Could you use the same beige tone as the previous table linen, or does this belong to the hotel bedding project?', body: 'Dear Chen,\n\nCould you use the same beige tone as the previous table linen? I am referring to the sample we discussed last week, but I have not included the project number here.\n\nRegards,\nCamille', attachments: ['Beige_Reference.jpg'], extracted: ['订单归属不明确', '提及此前桌布颜色及近期样品'] },
  { id: 'm11', customerId: 'c1', direction: 'inbound', sender: 'Emma Wilson <emma@northstarhome.com>', recipient: 'sales@company.com', subject: 'Question about packaging artwork', date: '2026-10-17', time: '18:06', preview: 'Please check whether the updated packaging artwork can be used for our next shipment.', body: 'Hi Lynn,\n\nPlease check whether the updated packaging artwork can be used for our next shipment. It is the same artwork family we used before, but I have not decided which order to apply it to.\n\nBest,\nEmma', attachments: ['Artwork_v3.pdf'], extracted: ['包装方案变更', '订单归属需人工确认'] },
  { id: 'm12', customerId: 'c6', direction: 'inbound', sender: 'Sophie Martin <sophie@riverton.ca>', recipient: 'sales@company.com', subject: 'Delivery address update', date: '2026-10-16', time: '10:31', preview: 'Please confirm whether we can update the delivery address for the current shipment.', body: 'Hi Ning,\n\nCould you please confirm whether we can update the delivery address for the current shipment? I will send the exact address in my next email.\n\nThanks,\nSophie', attachments: [], extracted: ['待确认的地址变更', '邮件未写明订单编号'] },
]

export const initialReviews: Review[] = [
  { id: 'r1', emailId: 'm10', customerId: 'c2', reason: '邮件同时提到已完成的桌布订单和近期酒店布草样品，缺少订单号。', candidates: ['o3', 'o8'], selectedOrderId: 'o3' },
  { id: 'r2', emailId: 'm11', customerId: 'c1', reason: '包装图稿可能用于当前补货，也可能只是历史订单的延续。', candidates: ['o1', 'o2'], selectedOrderId: 'o1' },
  { id: 'r3', emailId: 'm12', customerId: 'c6', reason: '客户有两笔同时进行的项目，地址变更未明确指向哪一笔。', candidates: ['o7', 'o9'], selectedOrderId: 'o7' },
]

export function customerOf(id: string) { return customers.find(customer => customer.id === id)! }
export function emailOf(id: string) { return emails.find(email => email.id === id)! }
