import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity, ArrowDownLeft, ArrowRight, ArrowUpRight, Bell, CalendarDays, Check,
  CheckCircle2, ChevronDown, ChevronRight, CircleHelp, Clock3,
  Columns3, FileText, Filter, Inbox, LayoutDashboard, List, Mail, Menu,
  MessageSquareText, Package, Paperclip, RotateCcw, Search, Send,
  ShieldCheck, Sparkles, UsersRound, X,
} from 'lucide-react'
import {
  customerOf, customers, emailOf, emails, initialOrders, initialReviews, stages,
  type Customer, type Order, type Review, type Stage,
} from './data'

type Page = 'overview' | 'customers' | 'orders' | 'inbox' | 'reviews'
type OrderFilter = Stage | '全部' | '进行中' | '近期需跟进'
type DemoState = { orders: Order[]; reviews: Review[]; assignments: Record<string, string> }

const STORAGE_KEY = 'mailflow-demo-v1'
const ACCOUNT_KEY = 'mailflow-demo-account-v1'
const accounts = [
  { id: 'lin', name: '林悦', initial: '林', role: '业务经理', email: 'lin.yue@example.com', tone: 'blue' },
  { id: 'chen', name: '陈舟', initial: '陈', role: '销售专员', email: 'chen.zhou@example.com', tone: 'violet' },
  { id: 'zhou', name: '周宁', initial: '周', role: '销售专员', email: 'zhou.ning@example.com', tone: 'amber' },
] as const
const initialState: DemoState = { orders: initialOrders, reviews: initialReviews, assignments: {} }

function readAccountId() {
  const id = localStorage.getItem(ACCOUNT_KEY)
  return accounts.some(account => account.id === id) ? id! : accounts[0].id
}

function readState(): DemoState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return initialState
    const parsed = JSON.parse(saved) as DemoState
    if (Array.isArray(parsed.orders) && Array.isArray(parsed.reviews) && parsed.assignments) return parsed
  } catch { /* Damaged demo state falls back to sample data. */ }
  return initialState
}

function formatDate(date: string) {
  const parts = date.split('-')
  return parts.length === 3 ? `${Number(parts[1])}月${Number(parts[2])}日` : date
}

function todayLabel() {
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }).format(new Date())
}

function Avatar({ customer, size = 'normal' }: { customer: Customer; size?: 'normal' | 'large' }) {
  return <span className={`avatar avatar-${customer.color} ${size === 'large' ? 'avatar-large' : ''}`}>{customer.shortName}</span>
}

function StageBadge({ stage }: { stage: Stage }) {
  return <span className={`stage-badge stage-${stages.indexOf(stage)}`}><span className="stage-dot" />{stage}</span>
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="empty-state"><Inbox size={30} strokeWidth={1.5} /><strong>{title}</strong><span>{description}</span></div>
}

function AccountAvatar({ account, size = 'normal' }: { account: typeof accounts[number]; size?: 'normal' | 'small' }) {
  return <span className={`account-avatar account-avatar-${account.tone} ${size === 'small' ? 'account-avatar-small' : ''}`}>{account.initial}</span>
}

function App() {
  const [demo, setDemo] = useState<DemoState>(readState)
  const [accountId, setAccountId] = useState(readAccountId)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const accountMenuRef = useRef<HTMLDivElement>(null)
  const [page, setPage] = useState<Page>('overview')
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState<OrderFilter>('全部')
  const [ownerFilter, setOwnerFilter] = useState('全部负责人')
  const [orderView, setOrderView] = useState<'board' | 'list'>('board')
  const [mailFilter, setMailFilter] = useState<'all' | 'inbound' | 'outbound'>('all')
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [selectedEmailId, setSelectedEmailId] = useState('m1')
  const [note, setNote] = useState('')
  const [mobileNav, setMobileNav] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(demo)) }, [demo])
  useEffect(() => { localStorage.setItem(ACCOUNT_KEY, accountId) }, [accountId])
  useEffect(() => {
    if (!accountMenuOpen) return
    function closeOnOutsideClick(event: PointerEvent) {
      if (!accountMenuRef.current?.contains(event.target as Node)) setAccountMenuOpen(false)
    }
    function closeOnEscape(event: KeyboardEvent) { if (event.key === 'Escape') setAccountMenuOpen(false) }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => { document.removeEventListener('pointerdown', closeOnOutsideClick); document.removeEventListener('keydown', closeOnEscape) }
  }, [accountMenuOpen])
  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(''), 3400)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const orders = demo.orders
  const currentAccount = accounts.find(account => account.id === accountId) || accounts[0]
  const activeOrders = orders.filter(order => order.stage !== '已完成')
  const activeCustomerCount = new Set(activeOrders.map(order => order.customerId)).size
  const myDueOrders = activeOrders.filter(order => order.owner === currentAccount.name && (order.dueDate === '今天' || order.dueDate === '明天'))
  const dueCount = myDueOrders.length
  const selectedOrder = orders.find(order => order.id === selectedOrderId)
  const selectedCustomer = customers.find(customer => customer.id === selectedCustomerId)
  const selectedEmail = emailOf(selectedEmailId)

  const filteredOrders = useMemo(() => orders.filter(order => {
    const customer = customerOf(order.customerId)
    const matchSearch = `${order.title} ${order.reference} ${order.product} ${customer.name} ${customer.contact}`.toLowerCase().includes(search.toLowerCase())
    const matchStage = stageFilter === '全部' || (stageFilter === '进行中' && order.stage !== '已完成') || (stageFilter === '近期需跟进' && order.stage !== '已完成' && (order.dueDate === '今天' || order.dueDate === '明天')) || order.stage === stageFilter
    return matchSearch && matchStage && (ownerFilter === '全部负责人' || order.owner === ownerFilter)
  }), [orders, search, stageFilter, ownerFilter])

  const filteredCustomers = useMemo(() => customers.filter(customer => `${customer.name} ${customer.contact} ${customer.email} ${customer.country}`.toLowerCase().includes(search.toLowerCase())), [search])
  const filteredEmails = useMemo(() => emails.filter(email => {
    const customer = customerOf(email.customerId)
    const matchSearch = `${email.subject} ${email.sender} ${customer.name} ${email.preview}`.toLowerCase().includes(search.toLowerCase())
    return matchSearch && (mailFilter === 'all' || email.direction === mailFilter)
  }), [search, mailFilter])

  function navigate(next: Page) {
    setPage(next)
    setSearch('')
    if (next === 'orders') { setStageFilter('全部'); setOwnerFilter('全部负责人') }
    if (next === 'inbox') setMailFilter('all')
    setMobileNav(false)
    setAccountMenuOpen(false)
    setSelectedOrderId(null)
    setSelectedCustomerId(null)
  }

  function openOrders(filter: OrderFilter, owner = '全部负责人', view: 'board' | 'list' = 'board') {
    navigate('orders')
    setStageFilter(filter)
    setOwnerFilter(owner)
    setOrderView(view)
  }

  function switchAccount(id: typeof accounts[number]['id']) {
    const nextAccount = accounts.find(account => account.id === id)!
    setAccountId(id)
    setAccountMenuOpen(false)
    setOwnerFilter('全部负责人')
    setToast(`已切换为 ${nextAccount.name} · ${nextAccount.role}`)
  }

  function openOrder(id: string) { setSelectedCustomerId(null); setSelectedOrderId(id); setNote('') }
  function openCustomer(id: string) { setSelectedOrderId(null); setSelectedCustomerId(id) }
  function openEmail(id: string) { setSelectedOrderId(null); setSelectedCustomerId(null); setSelectedEmailId(id); setPage('inbox'); setSearch(''); setMailFilter('all') }

  function updateStage(orderId: string, stage: Stage) {
    setDemo(previous => ({ ...previous, orders: previous.orders.map(order => order.id === orderId ? {
      ...order, stage, confidence: '已核实', updatedAt: new Date().toISOString().slice(0, 10),
      events: [{ id: crypto.randomUUID(), date: '刚刚', title: `人工调整阶段为“${stage}”`, detail: `由 ${currentAccount.name} 调整。`, kind: 'note' }, ...order.events],
    } : order) }))
    setToast('订单阶段已更新，并记录在时间线中')
  }

  function addNote(orderId: string) {
    const value = note.trim()
    if (!value) return
    setDemo(previous => ({ ...previous, orders: previous.orders.map(order => order.id === orderId ? {
      ...order, updatedAt: new Date().toISOString().slice(0, 10),
      events: [{ id: crypto.randomUUID(), date: '刚刚', title: `${currentAccount.name} 新增内部备注`, detail: value, kind: 'note' }, ...order.events],
    } : order) }))
    setNote('')
    setToast('内部备注已保存')
  }

  function confirmReview(review: Review) {
    const email = emailOf(review.emailId)
    const target = orders.find(order => order.id === review.selectedOrderId)
    if (!target) return
    setDemo(previous => ({
      ...previous,
      reviews: previous.reviews.filter(item => item.id !== review.id),
      assignments: { ...previous.assignments, [review.emailId]: review.selectedOrderId },
      orders: previous.orders.map(order => order.id === review.selectedOrderId ? {
        ...order,
        updatedAt: new Date().toISOString().slice(0, 10),
        events: [{ id: crypto.randomUUID(), date: '刚刚', title: '人工确认邮件归属', detail: `${currentAccount.name} 将邮件“${email.subject}”关联到此订单。`, kind: 'note', emailId: email.id }, ...order.events],
      } : order),
    }))
    setToast(`已关联到 ${target.reference}`)
  }

  function resetDemo() {
    if (!window.confirm('确定恢复演示数据？当前浏览器中的阶段修改、备注和人工确认记录会清除。')) return
    setDemo(structuredClone(initialState))
    setSelectedOrderId(null)
    setSelectedCustomerId(null)
    setToast('演示数据已恢复')
  }

  const navItems = [
    { page: 'overview' as Page, label: '工作台', icon: LayoutDashboard },
    { page: 'customers' as Page, label: '客户', icon: UsersRound },
    { page: 'orders' as Page, label: '订单', icon: Package },
    { page: 'inbox' as Page, label: '沟通邮件', icon: Mail },
    { page: 'reviews' as Page, label: '待人工确认', icon: ShieldCheck, count: demo.reviews.length },
  ]
  const pageTitles: Record<Page, string> = { overview: '工作台', customers: '客户档案', orders: '订单进度', inbox: '沟通邮件', reviews: '待人工确认' }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
      <div className="brand" onClick={() => navigate('overview')} role="button" tabIndex={0} onKeyDown={event => { if (event.key === 'Enter') navigate('overview') }}>
        <div className="brand-mark"><MessageSquareText size={20} strokeWidth={2.4} /></div>
        <div className="brand-copy"><strong>询单台</strong><span>MAILFLOW WORKSPACE</span></div>
      </div>
      <div className="workspace-switch"><div className="workspace-icon">M</div><div><strong>外贸业务团队</strong><small>演示工作区</small></div><ChevronDown size={15} /></div>
      <div className="nav-caption">主菜单</div>
      <nav className="nav-list" aria-label="主导航">{navItems.map(item => <button key={item.page} className={`nav-item ${page === item.page ? 'active' : ''}`} onClick={() => navigate(item.page)}><item.icon size={18} strokeWidth={1.9} /><span>{item.label}</span>{item.count ? <b className="nav-count">{item.count}</b> : null}</button>)}</nav>
      <div className="sidebar-bottom">
        <div className="sidebar-user"><AccountAvatar account={currentAccount} /><div><strong>{currentAccount.name}</strong><small>{currentAccount.role} · 演示账号</small></div></div>
      </div>
    </aside>
    {mobileNav && <button className="mobile-scrim" onClick={() => setMobileNav(false)} aria-label="关闭导航" />}

    <div className="main-shell">
      <header className="topbar">
        <div className="topbar-left"><button className="icon-button mobile-menu" onClick={() => setMobileNav(true)} aria-label="打开导航"><Menu size={21} /></button><span className="breadcrumb">外贸业务团队</span><ChevronRight size={15} /><strong>{pageTitles[page]}</strong></div>
        <div className="topbar-actions"><span className="demo-pill"><span className="demo-dot" /> 演示数据</span><span className="topbar-divider" /><button className="icon-button" onClick={() => setShowGuide(true)} aria-label="查看演示说明"><CircleHelp size={19} /></button><button className="icon-button notify-button" onClick={() => navigate('reviews')} aria-label="查看待确认事项"><Bell size={19} />{demo.reviews.length > 0 && <span />}</button><div className="account-switcher" ref={accountMenuRef}><button className={`account-trigger ${accountMenuOpen ? 'active' : ''}`} onClick={() => setAccountMenuOpen(open => !open)} aria-expanded={accountMenuOpen} aria-haspopup="menu" aria-label={`当前账号 ${currentAccount.name}，切换账号`}><AccountAvatar account={currentAccount} size="small" /><ChevronDown size={13} /></button>{accountMenuOpen && <div className="account-menu" role="menu" aria-label="切换演示账号"><div className="account-menu-heading"><span>切换账号</span><small>外贸业务团队 · 前端演示</small></div><div className="account-menu-list">{accounts.map(account => <button key={account.id} role="menuitemradio" aria-checked={account.id === accountId} className={`account-option ${account.id === accountId ? 'selected' : ''}`} onClick={() => switchAccount(account.id)}><AccountAvatar account={account} /><span className="account-option-info"><strong>{account.name} <small>{account.role}</small></strong><span>{account.email}</span></span>{account.id === accountId && <Check size={16} className="account-check" />}</button>)}</div><div className="account-menu-note"><ShieldCheck size={14} />仅切换演示身份，暂未接入登录系统</div></div>}</div></div>
      </header>

      <main className={`page-content page-${page}`}>
        {page === 'overview' && <>
          <div className="page-heading overview-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> {todayLabel()}</div><h1>业务总览<span className="title-sparkle">✳</span></h1><p>从邮件到订单，快速找到今天值得跟进的事。</p></div><button className="secondary-button" onClick={() => setShowGuide(true)}><CircleHelp size={16} /> 这是什么演示</button></div>
          <div className="stats-grid">
            <button className="stat-card" onClick={() => navigate('customers')} aria-label={`查看 ${activeCustomerCount} 家活跃客户`}><span className="stat-icon stat-blue"><UsersRound size={20} /></span><div className="stat-value">{activeCustomerCount}<small>家</small></div><strong>活跃客户</strong><p>当前有订单在跟进</p><ArrowUpRight className="stat-arrow" size={17} /></button>
            <button className="stat-card" onClick={() => openOrders('进行中')} aria-label={`查看 ${activeOrders.length} 笔进行中订单`}><span className="stat-icon stat-violet"><Package size={20} /></span><div className="stat-value">{activeOrders.length}<small>笔</small></div><strong>进行中订单</strong><p>跨 {stages.length - 1} 个业务阶段</p><ArrowUpRight className="stat-arrow" size={17} /></button>
            <button className="stat-card" onClick={() => openOrders('近期需跟进', currentAccount.name, 'list')} aria-label={`查看 ${currentAccount.name} 近期需跟进的 ${dueCount} 笔订单`}><span className="stat-icon stat-amber"><Clock3 size={20} /></span><div className="stat-value">{dueCount}<small>项</small></div><strong>近期需跟进</strong><p>{currentAccount.name} · 今天或明天</p><ArrowUpRight className="stat-arrow" size={17} /></button>
            <button className="stat-card" onClick={() => navigate('reviews')} aria-label={`处理 ${demo.reviews.length} 封待确认邮件`}><span className="stat-icon stat-rose"><ShieldCheck size={20} /></span><div className="stat-value">{demo.reviews.length}<small>封</small></div><strong>待确认归属</strong><p>需要人工判断的邮件</p><ArrowUpRight className="stat-arrow" size={17} /></button>
          </div>
          <div className="overview-grid">
            <section className="panel focus-panel"><div className="panel-heading"><div><div className="section-kicker">NEEDS ATTENTION</div><h2>我的优先处理</h2></div><button className="text-button" onClick={() => openOrders('近期需跟进', currentAccount.name, 'list')}>查看我的待办 <ArrowRight size={16} /></button></div>
              <div className="focus-list">{myDueOrders.slice(0, 4).map(order => { const customer = customerOf(order.customerId); return <button className="focus-row" key={order.id} onClick={() => openOrder(order.id)}><span className={`focus-status ${order.dueDate === '今天' ? 'urgent' : ''}`}><Clock3 size={15} /></span><div className="focus-main"><strong>{order.nextAction}</strong><span>{customer.name} <span className="separator-dot">·</span> {order.title}</span></div><span className={`due-tag ${order.dueDate === '今天' ? 'due-today' : ''}`}>{order.dueDate}</span><ChevronRight size={17} className="muted-icon" /></button> })}</div>
              <div className="focus-foot"><span><span className="blue-dot" /> {demo.reviews.length} 封邮件等待确认归属</span><button onClick={() => navigate('reviews')}>去处理 <ArrowRight size={14} /></button></div>
            </section>
            <section className="panel pipeline-panel"><div className="panel-heading"><div><div className="section-kicker">PIPELINE</div><h2>订单阶段</h2></div><button className="round-more" onClick={() => navigate('orders')} aria-label="查看订单看板"><ArrowUpRight size={17} /></button></div><div className="pipeline-list">{stages.map((stage, index) => { const count = orders.filter(order => order.stage === stage).length; return <button className="pipeline-row" key={stage} onClick={() => { navigate('orders'); setStageFilter(stage) }}><span className={`pipeline-marker marker-${index}`} /><span>{stage}</span><div className="pipeline-track"><div className={`pipeline-fill fill-${index}`} style={{ width: `${Math.max(8, count / orders.length * 100 * 2.5)}%` }} /></div><strong>{count}</strong></button> })}</div><div className="pipeline-foot"><span>共 {orders.length} 笔订单（含已完成）</span><ArrowRight size={15} /></div></section>
          </div>
          <section className="panel recent-panel"><div className="panel-heading"><div><div className="section-kicker">RECENT ACTIVITY</div><h2>最近沟通</h2></div><button className="text-button" onClick={() => navigate('inbox')}>查看全部邮件 <ArrowRight size={16} /></button></div><div className="recent-list">{emails.slice(0, 4).map(email => { const customer = customerOf(email.customerId); return <button className="recent-row" key={email.id} onClick={() => openEmail(email.id)}><Avatar customer={customer} /><div className="recent-main"><strong>{email.subject}</strong><span>{customer.name} <span className="separator-dot">·</span> {email.preview}</span></div><span className="recent-time">{formatDate(email.date)}<br />{email.time}</span><ChevronRight size={17} className="muted-icon" /></button> })}</div></section>
        </>}

        {page === 'customers' && <>
          <div className="page-heading"><div><div className="eyebrow">CUSTOMER DIRECTORY</div><h1>客户档案</h1><p>把重复采购和长期沟通放在同一客户下。</p></div><div className="heading-side"><span className="count-label">共 {customers.length} 家客户</span></div></div>
          <div className="panel table-panel"><div className="list-toolbar"><div className="search-field"><Search size={18} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="搜索客户、联系人或邮箱" aria-label="搜索客户" /></div><div className="toolbar-caption"><Filter size={15} /> 按最近沟通展示</div></div><div className="table-scroll"><table className="data-table customer-table"><thead><tr><th>客户</th><th>联系人</th><th>订单概况</th><th>最新沟通</th><th>负责人</th><th /></tr></thead><tbody>{filteredCustomers.map(customer => { const customerOrders = orders.filter(order => order.customerId === customer.id); const recentEmail = emails.find(email => email.customerId === customer.id); return <tr key={customer.id} onClick={() => openCustomer(customer.id)} tabIndex={0} onKeyDown={event => { if (event.key === 'Enter') openCustomer(customer.id) }}><td><div className="customer-cell"><Avatar customer={customer} /><div><strong>{customer.name}</strong><span>{customer.country} <span className="separator-dot">·</span> {customer.tags[0]}</span></div></div></td><td><div className="stacked-cell"><strong>{customer.contact}</strong><span>{customer.email}</span></div></td><td><div className="stacked-cell"><strong>{customerOrders.filter(order => order.stage !== '已完成').length} 笔进行中</strong><span>累计 {customerOrders.length} 笔订单</span></div></td><td><div className="stacked-cell"><strong>{recentEmail ? formatDate(recentEmail.date) : '—'}</strong><span>{recentEmail?.subject || '暂无邮件'}</span></div></td><td>{customer.owner}</td><td><ChevronRight size={17} className="muted-icon" /></td></tr> })}</tbody></table>{filteredCustomers.length === 0 && <EmptyState title="没有找到客户" description="试试其他客户名称、联系人或邮箱。" />}</div></div>
        </>}

        {page === 'orders' && <>
          <div className="page-heading"><div><div className="eyebrow">ORDER PIPELINE</div><h1>订单进度</h1><p>每一笔采购独立跟踪，复购也有清晰的历史记录。</p></div><span className="count-label">当前 {filteredOrders.length} / 共 {orders.length} 笔订单</span></div>
          <div className="order-toolbar"><div className="search-field"><Search size={18} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="搜索客户、产品或订单号" aria-label="搜索订单" /></div><div className="stage-filter"><Filter size={16} /><select value={stageFilter} onChange={event => setStageFilter(event.target.value as OrderFilter)} aria-label="筛选订单阶段"><option value="全部">全部阶段</option><option value="进行中">进行中订单</option><option value="近期需跟进">近期需跟进</option>{stages.map(stage => <option key={stage} value={stage}>{stage}</option>)}</select><ChevronDown size={14} /></div><div className="stage-filter owner-filter"><UsersRound size={16} /><select value={ownerFilter} onChange={event => setOwnerFilter(event.target.value)} aria-label="筛选负责人"><option value="全部负责人">全部负责人</option>{accounts.map(account => <option key={account.id} value={account.name}>{account.name}</option>)}</select><ChevronDown size={14} /></div><div className="view-toggle"><button className={orderView === 'board' ? 'selected' : ''} onClick={() => setOrderView('board')} aria-label="看板视图"><Columns3 size={17} /></button><button className={orderView === 'list' ? 'selected' : ''} onClick={() => setOrderView('list')} aria-label="列表视图"><List size={17} /></button></div></div>
          {orderView === 'board' ? <div className="board-scroll"><div className="kanban-board">{stages.filter(stage => stageFilter === '全部' || stageFilter === stage || ((stageFilter === '进行中' || stageFilter === '近期需跟进') && stage !== '已完成')).map(stage => { const index = stages.indexOf(stage); const stageOrders = filteredOrders.filter(order => order.stage === stage); return <section className="kanban-column" key={stage}><div className="kanban-head"><span className={`column-dot marker-${index}`} /><strong>{stage}</strong><span className="column-count">{stageOrders.length}</span></div><div className="kanban-cards">{stageOrders.map(order => { const customer = customerOf(order.customerId); return <button key={order.id} className="order-card" onClick={() => openOrder(order.id)}><div className="order-card-top"><span className="order-ref">{order.reference}</span><ArrowUpRight size={16} /></div><strong className="order-card-title">{order.title}</strong><div className="order-card-customer"><Avatar customer={customer} /><span>{customer.name}</span></div><div className="order-card-divider" /><div className="order-card-meta"><span>金额</span><strong>{order.amount}</strong></div><div className="order-card-meta"><span>更新</span><strong>{formatDate(order.updatedAt)}</strong></div><div className="order-card-next"><Clock3 size={14} /> {order.nextAction}</div></button> })}{stageOrders.length === 0 && <div className="kanban-empty">此阶段暂无匹配订单</div>}</div></section> })}</div></div> : <div className="panel table-panel"><div className="table-scroll"><table className="data-table order-table"><thead><tr><th>订单 / 产品</th><th>客户</th><th>阶段</th><th>金额</th><th>下一步</th><th>负责人</th><th /></tr></thead><tbody>{filteredOrders.map(order => { const customer = customerOf(order.customerId); return <tr key={order.id} onClick={() => openOrder(order.id)} tabIndex={0} onKeyDown={event => { if (event.key === 'Enter') openOrder(order.id) }}><td><div className="stacked-cell"><strong>{order.title}</strong><span>{order.reference} · {order.product}</span></div></td><td><div className="table-customer"><Avatar customer={customer} />{customer.name}</div></td><td><StageBadge stage={order.stage} /></td><td className="amount-cell">{order.amount}</td><td><div className="stacked-cell"><strong>{order.nextAction}</strong><span>{order.dueDate}</span></div></td><td>{order.owner}</td><td><ChevronRight size={16} className="muted-icon" /></td></tr> })}</tbody></table>{filteredOrders.length === 0 && <EmptyState title="没有匹配的订单" description="调整搜索词或阶段筛选。" />}</div></div>}
        </>}

        {page === 'inbox' && <>
          <div className="page-heading"><div><div className="eyebrow">COMMUNICATION HUB</div><h1>沟通邮件</h1><p>收发邮件放在一起看，并能回到对应客户和订单。</p></div><span className="count-label">演示邮件 {emails.length} 封</span></div>
          <div className="mail-shell"><section className="mail-list-panel"><div className="mail-list-toolbar"><div className="search-field"><Search size={17} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="搜索邮件内容或客户" aria-label="搜索邮件" /></div><div className="mail-tabs"><button className={mailFilter === 'all' ? 'selected' : ''} onClick={() => setMailFilter('all')}>全部</button><button className={mailFilter === 'inbound' ? 'selected' : ''} onClick={() => setMailFilter('inbound')}>收件</button><button className={mailFilter === 'outbound' ? 'selected' : ''} onClick={() => setMailFilter('outbound')}>已发送</button></div></div><div className="mail-items">{filteredEmails.map(email => { const customer = customerOf(email.customerId); return <button key={email.id} className={`mail-item ${selectedEmailId === email.id ? 'selected' : ''}`} onClick={() => setSelectedEmailId(email.id)}><Avatar customer={customer} /><div className="mail-item-main"><div className="mail-item-top"><strong>{customer.name}</strong><span>{formatDate(email.date)}</span></div><b>{email.subject}</b><p>{email.preview}</p><div className="mail-item-bottom">{email.direction === 'inbound' ? <><ArrowDownLeft size={13} /> 收件</> : <><Send size={12} /> 已发送</>}{email.attachments.length > 0 && <span><Paperclip size={12} /> {email.attachments.length}</span>}</div></div>{email.unread && <span className="unread-dot" />}</button> })}{filteredEmails.length === 0 && <EmptyState title="没有匹配的邮件" description="调整搜索词或收发件筛选。" />}</div></section>
            <section className="mail-detail-panel"><div className="mail-detail-header"><div className="mail-detail-kicker">邮件详情 <span>·</span> {selectedEmail.direction === 'inbound' ? '客户来信' : '我方发件'}</div><h2>{selectedEmail.subject}</h2><div className="mail-person"><Avatar customer={customerOf(selectedEmail.customerId)} /><div><strong>{selectedEmail.sender}</strong><span>收件人：{selectedEmail.recipient}</span></div><time>{formatDate(selectedEmail.date)} {selectedEmail.time}</time></div></div><div className="mail-body">{selectedEmail.body}</div>{selectedEmail.attachments.length > 0 && <div className="attachment-area"><strong>附件 · {selectedEmail.attachments.length}</strong><div>{selectedEmail.attachments.map(name => <span key={name} className="attachment-chip"><FileText size={16} />{name}</span>)}</div><small>演示附件仅展示文件名，暂不提供真实下载。</small></div>}<div className="ai-extract"><div><Sparkles size={17} /><strong>AI 提取的业务线索</strong><span>演示</span></div><ul>{selectedEmail.extracted.map(line => <li key={line}>{line}</li>)}</ul></div><div className="mail-link-card"><div><span>关联订单</span>{(() => { const assignedOrderId = demo.assignments[selectedEmail.id] || selectedEmail.orderId; const order = orders.find(item => item.id === assignedOrderId); return order ? <><strong>{order.title}</strong><small>{order.reference} · {customerOf(order.customerId).name}</small></> : <><strong>等待人工确认</strong><small>该邮件暂未归入具体订单</small></> })()}</div>{(() => { const assignedOrderId = demo.assignments[selectedEmail.id] || selectedEmail.orderId; return assignedOrderId ? <button onClick={() => openOrder(assignedOrderId)}><ArrowUpRight size={18} /></button> : <button onClick={() => navigate('reviews')}><ArrowRight size={18} /></button> })()}</div></section>
          </div>
        </>}

        {page === 'reviews' && <>
          <div className="page-heading"><div><div className="eyebrow">HUMAN REVIEW</div><h1>待人工确认</h1><p>邮件可能对应多笔订单时，由业务人员核对后再入档。</p></div><span className="count-label">待处理 {demo.reviews.length} 封</span></div>
          <div className="review-intro"><ShieldCheck size={19} /><span>确认只会修改这封邮件的订单归属，并在目标订单时间线留下记录。以下内容都是演示数据。</span></div>
          <div className="review-grid">{demo.reviews.map(review => { const email = emailOf(review.emailId); const customer = customerOf(review.customerId); return <article className="review-card" key={review.id}><div className="review-top"><div className="review-customer"><Avatar customer={customer} /><div><strong>{customer.name}</strong><span>{formatDate(email.date)} · {email.time}</span></div></div><span className="review-label"><Sparkles size={13} /> 需判断</span></div><h2>{email.subject}</h2><p className="review-preview">{email.preview}</p><div className="review-reason"><CircleHelp size={16} /><span>{review.reason}</span></div><div className="candidate-label">选择关联订单</div><div className="candidate-list">{review.candidates.map(id => { const order = orders.find(item => item.id === id)!; return <label className={`candidate-option ${review.selectedOrderId === id ? 'selected' : ''}`} key={id}><input type="radio" name={review.id} checked={review.selectedOrderId === id} onChange={() => setDemo(previous => ({ ...previous, reviews: previous.reviews.map(item => item.id === review.id ? { ...item, selectedOrderId: id } : item) }))} /><div><strong>{order.title}</strong><span>{order.reference} · {order.stage}</span></div><span className="radio-visual">{review.selectedOrderId === id && <Check size={12} />}</span></label> })}</div><div className="review-actions"><button className="ghost-button" onClick={() => openEmail(email.id)}>查看原邮件</button><button className="primary-button" onClick={() => confirmReview(review)}><Check size={16} /> 确认关联</button></div></article> })}</div>{demo.reviews.length === 0 && <div className="panel"><EmptyState title="所有待确认邮件都已处理" description="已确认的邮件可在对应订单时间线和沟通邮件中查看。" /></div>}
        </>}
      </main>
    </div>

    {selectedOrder && <div className="overlay" onMouseDown={event => { if (event.target === event.currentTarget) setSelectedOrderId(null) }}><aside className="detail-drawer" role="dialog" aria-modal="true" aria-label="订单详情"><div className="drawer-top"><span>订单详情 <span className="drawer-separator">/</span> {selectedOrder.reference}</span><button className="icon-button" onClick={() => setSelectedOrderId(null)} aria-label="关闭订单详情"><X size={21} /></button></div><div className="drawer-scroll"><div className="drawer-title-block"><div className="drawer-customer-link" onClick={() => openCustomer(selectedOrder.customerId)} role="button" tabIndex={0} onKeyDown={event => { if (event.key === 'Enter') openCustomer(selectedOrder.customerId) }}><Avatar customer={customerOf(selectedOrder.customerId)} />{customerOf(selectedOrder.customerId).name}<ChevronRight size={14} /></div><h2>{selectedOrder.title}</h2><div className="drawer-tags"><StageBadge stage={selectedOrder.stage} /><span className="reference-tag">{selectedOrder.reference}</span></div></div><div className="summary-box"><div><Sparkles size={17} /><strong>沟通摘要</strong><span className={selectedOrder.confidence === 'AI 建议' ? 'suggestion-label' : 'verified-label'}>{selectedOrder.confidence}</span></div><p>{selectedOrder.summary}</p></div><div className="drawer-section"><div className="drawer-section-head"><h3>订单信息</h3><span>可调整阶段</span></div><div className="fact-grid"><div><span>产品</span><strong>{selectedOrder.product}</strong></div><div><span>数量</span><strong>{selectedOrder.quantity}</strong></div><div><span>金额</span><strong>{selectedOrder.amount}</strong></div><div><span>负责人</span><strong>{selectedOrder.owner}</strong></div></div><label className="stage-edit"><span>当前阶段</span><select value={selectedOrder.stage} onChange={event => updateStage(selectedOrder.id, event.target.value as Stage)}>{stages.map(stage => <option key={stage} value={stage}>{stage}</option>)}</select><ChevronDown size={16} /></label></div><div className="next-action-box"><div><CalendarDays size={17} /><strong>下一步</strong><span>{selectedOrder.dueDate}</span></div><p>{selectedOrder.nextAction}</p></div><div className="drawer-section"><div className="drawer-section-head"><h3>沟通时间线</h3><span>{selectedOrder.events.length} 条记录</span></div><div className="timeline">{selectedOrder.events.map(event => <div className="timeline-item" key={event.id}><span className={`timeline-icon ${event.kind}`}><Activity size={14} /></span><div><time>{event.date}</time><strong>{event.title}</strong><p>{event.detail}</p>{event.emailId && <button onClick={() => openEmail(event.emailId!)}>查看原邮件 <ArrowUpRight size={13} /></button>}</div></div>)}</div></div><div className="drawer-section note-section"><h3>添加内部备注</h3><textarea value={note} onChange={event => setNote(event.target.value)} placeholder="记录电话沟通、业务判断或下一步安排..." rows={3} /><button className="primary-button" disabled={!note.trim()} onClick={() => addNote(selectedOrder.id)}>保存备注</button></div></div></aside></div>}

    {selectedCustomer && <div className="overlay" onMouseDown={event => { if (event.target === event.currentTarget) setSelectedCustomerId(null) }}><aside className="detail-drawer customer-drawer" role="dialog" aria-modal="true" aria-label="客户详情"><div className="drawer-top"><span>客户档案</span><button className="icon-button" onClick={() => setSelectedCustomerId(null)} aria-label="关闭客户详情"><X size={21} /></button></div><div className="drawer-scroll"><div className="customer-profile"><Avatar customer={selectedCustomer} size="large" /><h2>{selectedCustomer.name}</h2><span>{selectedCustomer.country} · 合作始于 {selectedCustomer.since}</span><div>{selectedCustomer.tags.map(tag => <b key={tag}>{tag}</b>)}</div></div><div className="drawer-section"><h3>联系人</h3><div className="contact-card"><div className="person-icon"><UsersRound size={19} /></div><div><strong>{selectedCustomer.contact}</strong><span>{selectedCustomer.email}</span></div></div><div className="owner-line">业务负责人 <strong>{selectedCustomer.owner}</strong></div></div><div className="drawer-section"><div className="drawer-section-head"><h3>历史与当前订单</h3><span>{orders.filter(order => order.customerId === selectedCustomer.id).length} 笔</span></div><div className="customer-orders">{orders.filter(order => order.customerId === selectedCustomer.id).map(order => <button key={order.id} onClick={() => openOrder(order.id)}><div><strong>{order.title}</strong><span>{order.reference} · {order.amount}</span></div><StageBadge stage={order.stage} /><ChevronRight size={16} /></button>)}</div></div><div className="drawer-section"><div className="drawer-section-head"><h3>最近沟通</h3><span>{emails.filter(email => email.customerId === selectedCustomer.id).length} 封演示邮件</span></div><div className="customer-mails">{emails.filter(email => email.customerId === selectedCustomer.id).slice(0, 4).map(email => <button key={email.id} onClick={() => openEmail(email.id)}><Mail size={16} /><span>{email.subject}</span><ChevronRight size={15} /></button>)}</div></div></div></aside></div>}

    {showGuide && <div className="overlay modal-overlay" onMouseDown={event => { if (event.target === event.currentTarget) setShowGuide(false) }}><div className="guide-modal" role="dialog" aria-modal="true" aria-label="演示说明"><button className="icon-button guide-close" onClick={() => setShowGuide(false)} aria-label="关闭演示说明"><X size={20} /></button><div className="guide-icon"><Sparkles size={25} /></div><h2>先体验真实的业务路径</h2><p>这是纯前端原型，帮助你判断布局和操作是否适合团队。客户、订单和邮件都是模拟数据。</p><div className="guide-steps"><div><span>01</span><strong>从工作台找待办</strong><small>点进订单，查看摘要、下一步和沟通时间线。</small></div><div><span>02</span><strong>查看客户复购</strong><small>同一客户下可看到独立的历史订单和新订单。</small></div><div><span>03</span><strong>处理含糊邮件</strong><small>在“待人工确认”里选择订单，关联结果会留下记录。</small></div></div><div className="guide-footer"><button className="ghost-button" onClick={resetDemo}><RotateCcw size={15} /> 恢复演示数据</button><button className="primary-button" onClick={() => setShowGuide(false)}>开始体验 <ArrowRight size={16} /></button></div><div className="guide-note"><ShieldCheck size={15} /> 修改保存在当前浏览器；没有连接真实邮箱或服务器。</div></div></div>}
    {toast && <div className="toast"><CheckCircle2 size={18} />{toast}</div>}
  </div>
}

export default App
