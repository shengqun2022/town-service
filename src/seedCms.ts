/** 与小程序 `src/data/mock.js` 对齐的默认 CMS JSON（新建镇 / 重置 / 空库 seed） */
export function createSeedCmsJson(townId: string): string {
  const o = {
    townId,
    profile: {
      name: '阳光镇',
      slogan: '为人民服务 · 公开透明 · 便民利企',
      introShort:
        '阳光镇位于县域中部，镇域面积约120平方公里，户籍人口约3.2万人。全镇坚持生态优先、绿色发展，统筹推进现代农业、乡村旅游与基层治理，努力打造宜居宜业和美乡村示范镇。',
      introBlocks: [
        {
          id: 'ib1',
          title: '区位与交通',
          body: '镇区距县城约18公里，省道穿境而过，行政村公路硬化率100%，公交班线覆盖主要居民点，群众出行便利。',
          sort: 0,
        },
        {
          id: 'ib2',
          title: '历史沿革',
          body: '阳光镇建制历史悠久，改革开放以来特别是近年来，围绕产业强镇、生态立镇、文化兴镇目标，经济社会保持平稳健康发展。',
          sort: 1,
        },
        {
          id: 'ib3',
          title: '发展定位',
          body: '立足资源禀赋，做强优质稻米、生态果蔬与农旅融合产业，完善基层治理与公共服务，建设宜居宜业和美乡村示范镇。',
          sort: 2,
        },
      ],
      coverUrl: '',
    },
    policies: [
      {
        id: 'p1',
        title: '乡村振兴战略实施方案',
        pinned: true,
        date: '2026-05-10',
        summary: '为全面推进乡村振兴战略，结合本镇实际情况，制定本实施方案……',
        body: `第一章 总则

为深入贯彻落实中央关于实施乡村振兴战略的决策部署，结合我镇实际，制定本方案。

第二章 重点任务

一、产业兴旺。做强优质稻米、生态果蔬等特色农业，延伸农产品加工链条。

二、生态宜居。持续推进农村人居环境整治，健全垃圾收运与污水处理长效机制。

三、乡风文明。深化新时代文明实践活动，弘扬优秀传统文化。

四、治理有效。健全网格化治理体系，提升基层矛盾化解能力。

五、生活富裕。多渠道促进农民增收，完善社会保障与公共服务。

第三章 保障措施

加强组织领导，强化要素保障，严格督查考核，确保各项目标任务落地见效。

阳光镇人民政府\n2026年5月10日`,
        allowApply: false,
        applyTitle: '',
        status: 'published',
      },
      {
        id: 'p2',
        title: '农业补贴政策解读',
        pinned: false,
        date: '2026-05-08',
        summary: '2026年度农业补贴申请流程及注意事项……',
        body: `一、补贴对象：在本镇范围内从事粮食、油料等作物种植的农户及规模经营主体。

二、申报时间：即日起至2026年6月30日。

三、申报材料：身份证、土地承包经营权证或流转合同、种植面积确认表等。

四、办理流程：村级初审公示—镇农业办复核—县级审定发放。

具体标准以县级最新文件为准。咨询电话见本小程序「办公电话」栏目。

阳光镇农业综合服务中心\n2026年5月8日`,
        allowApply: false,
        applyTitle: '',
        status: 'published',
      },
      {
        id: 'p3',
        title: '新型农村合作医疗政策',
        pinned: false,
        date: '2026-05-05',
        summary: '关于调整新农合报销比例的通知……',
        body: `根据上级统一部署，我镇参合群众在县域内定点医疗机构住院报销比例有所上调，门诊慢特病用药保障范围进一步扩大。

具体报销比例、起付线与封顶线，请以县医保局发布的年度政策为准。参合缴费时间及方式请关注村组通知。

阳光镇社会事务办公室\n2026年5月5日`,
        allowApply: false,
        applyTitle: '',
        status: 'published',
      },
      {
        id: 'p4',
        title: '教育扶持政策说明',
        pinned: false,
        date: '2026-05-02',
        summary: '困难家庭学生资助政策详细说明……',
        body: `一、学前教育：对家庭经济困难儿童落实政府资助政策。

二、义务教育：落实「两免一补」，对寄宿生发放生活补助。

三、高中教育：国家助学金、免学杂费政策按条件申请。

四、高等教育：生源地信用助学贷款、新生入学资助等项目。

具体申请条件与流程请咨询镇中心学校或各中小学资助办。

阳光镇中心学校\n2026年5月2日`,
        allowApply: false,
        applyTitle: '',
        status: 'published',
      },
    ],
    announcements: [
      {
        id: 'n1',
        title: '关于开展春季农业生产工作的通知',
        date: '2026-05-10',
        summary: '为保障春耕生产有序开展，现就农资保障、技术指导与田间管理有关事项通知如下……',
        content: `各村委会、农业合作社、广大农户：

为扎实做好2026年春季农业生产工作，确保粮食安全和重要农产品供给，现将有关事项通知如下：

一、加强农资市场监管，保障种子、化肥、农药等物资供应充足、质量可靠。

二、镇农技站将组织技术人员分片包村，开展田间巡回指导，重点做好病虫害统防统治与科学施肥宣传。

三、请各行政村及时摸排灌溉设施运行情况，发现问题第一时间上报镇水利办。

阳光镇人民政府\n2026年5月10日`,
        status: 'published',
        listTag: '热',
        category: '重要通知',
      },
      {
        id: 'n2',
        title: '乡镇道路维修施工公告',
        date: '2026-05-08',
        summary: '因县道部分路段路面维修需要，施工期间将实行半幅通行，请过往车辆减速慢行……',
        content: `因县道阳光线K12+300—K14+100段路面维修施工需要，自2026年5月12日起至2026年6月20日止，上述路段实行半幅封闭施工、半幅双向通行。

施工期间请过往车辆服从现场指挥，减速慢行。由此带来的不便，敬请谅解。

阳光镇人民政府\n2026年5月8日`,
        status: 'published',
        listTag: '新',
        category: '政务公告',
      },
    ],
    jobs: [
      {
        id: 'j1',
        title: '茶园采摘工',
        employer: '和平村茶园',
        salary: '120元/天',
        location: '和平村茶园',
        needCount: 20,
        summary: '采茶季节性用工，日结工资 120 元，包午餐，有经验者优先',
        workPeriod: '2026-05-20 至 2026-06-10',
        body: '一、工作内容\n\n茶园采摘、鲜叶收集与简单分拣。\n\n二、用工时间\n\n2026-05-20 至 2026-06-10，每日 7:00—17:00，具体排班面议。\n\n三、待遇说明\n\n日结 120 元/天，包午餐。\n\n四、要求\n\n身体健康，有采茶经验者优先。',
        contactName: '王主任',
        contactPhone: '138****5566',
        fullPhone: '13800005566',
        tags: ['农业采摘'],
        recruitStatus: 'open',
        status: 'published',
        sort: 0,
        date: '2026-05-18',
      },
      {
        id: 'j2',
        title: '道路施工辅助工',
        employer: '阳光镇道路修缮项目部',
        salary: '150元/天',
        location: '阳光镇主干道',
        needCount: 8,
        summary: '配合道路修缮工程，搬运材料、辅助施工，日结 150 元',
        workPeriod: '2026-05-18 至 2026-05-30',
        body: '一、工作内容\n\n配合道路修缮，搬运建材、现场辅助施工。\n\n二、用工时间\n\n2026-05-18 至 2026-05-30。\n\n三、待遇说明\n\n日结 150 元/天。\n\n四、要求\n\n身体健康，服从现场安排，有工地经验者优先。',
        contactName: '李工头',
        contactPhone: '139****7788',
        fullPhone: '13900007788',
        tags: ['建筑施工'],
        recruitStatus: 'open',
        status: 'published',
        sort: 1,
        date: '2026-05-16',
      },
      {
        id: 'j3',
        title: '蔬菜基地帮工',
        employer: '丰收村蔬菜基地',
        salary: '100元/天',
        location: '丰收村蔬菜基地',
        needCount: 15,
        summary: '蔬菜种植、采摘、包装，日结 100 元',
        workPeriod: '2026-05-15 至 2026-05-25',
        body: '一、工作内容\n\n蔬菜种植辅助、采摘、分拣包装。\n\n二、待遇说明\n\n日结 100 元/天。\n\n本岗位当前已满员，可关注后续用工信息。',
        contactName: '张场长',
        contactPhone: '137****8899',
        fullPhone: '13700008899',
        tags: ['农业种植'],
        recruitStatus: 'full',
        status: 'published',
        sort: 2,
        date: '2026-05-10',
      },
    ],
    leaders: [
      {
        id: 'l1',
        name: '李明',
        title: '镇党委书记',
        phone: '0563-XXXX001',
        duty: '主持镇党委全面工作。负责党的建设、干部人事、党风廉政建设等工作。',
        avatarUrl: '',
        sort: 0,
      },
      {
        id: 'l2',
        name: '王强',
        title: '镇党委副书记、镇长',
        phone: '0563-XXXX002',
        duty: '主持镇政府全面工作。负责财政、审计、应急管理等工作。',
        avatarUrl: '',
        sort: 1,
      },
      {
        id: 'l3',
        name: '赵敏',
        title: '镇党委委员、副镇长',
        phone: '0563-XXXX003',
        duty: '分管农业农村、乡村振兴、水利等工作。',
        avatarUrl: '',
        sort: 2,
      },
    ],
    workers: [
      {
        id: 'w1',
        name: '张师傅',
        job: '电工',
        village: '阳光村',
        desc: '从事电工工作20年，持证上岗，擅长农户线路改造与故障排查。',
        phone: '138****1234',
        fullPhone: '13800001234',
        tags: ['电工', '高压证'],
        sort: 0,
      },
      {
        id: 'w2',
        name: '刘师傅',
        job: '水电工',
        village: '和平村',
        desc: '水电安装维修，承接新房布线、厨卫改造。',
        phone: '139****5678',
        fullPhone: '13900005678',
        tags: ['水电工'],
        sort: 1,
      },
      {
        id: 'w3',
        name: '陈师傅',
        job: '挖机',
        village: '建设村',
        desc: '小型挖掘机作业，农田整理、沟渠开挖经验丰富。',
        phone: '136****9012',
        fullPhone: '13600009012',
        tags: ['挖机', '运输'],
        sort: 2,
      },
    ],
    workerCategories: [
      { key: 'all', label: '全部', visible: true, sort: 0 },
      { key: '电工', label: '电工', visible: true, sort: 1 },
      { key: '水电工', label: '水电工', visible: true, sort: 2 },
      { key: '挖机', label: '挖机', visible: true, sort: 3 },
      { key: '运输', label: '运输', visible: true, sort: 4 },
    ],
    jobSupport: {
      title: '找工作支持配置',
      description: '围绕本镇招工信息、岗位推荐与求职咨询提供统一入口，支持后台直接维护。',
      quickTips: [
        '优先查看招工状态',
        '可按工种和村组筛选',
        '联系号码以完整号码为准',
      ],
      contactPhone: '0563-1234568',
    },
    products: [
      {
        id: 'm1',
        name: '阳光土蜂蜜',
        price: 0,
        desc: '纯天然野花蜜，无添加，农户自产自销。',
        tag: '热销',
        images: [],
        origin: '阳光村蜂场',
        contactPhone: '13800002345',
        onShelf: true,
        sort: 0,
      },
      {
        id: 'm2',
        name: '高山绿茶',
        price: 0,
        desc: '海拔800米高山茶园，清香回甘。',
        tag: '',
        images: [],
        origin: '和平村茶园',
        contactPhone: '13900006789',
        onShelf: true,
        sort: 1,
      },
      {
        id: 'm3',
        name: '生态香米',
        price: 0,
        desc: '有机种植，无农药，颗粒饱满。',
        tag: '',
        images: [],
        origin: '丰收村合作社',
        contactPhone: '13700003456',
        onShelf: true,
        sort: 2,
      },
    ],
    culture: {
      bannerTitle: '文化阳光',
      bannerSubtitle: '传承文脉 · 涵养乡风 · 共建精神家园',
      blocks: [
        {
          id: 'c1',
          title: '非遗与民俗',
          body: '阳光镇民风淳朴，传统节庆活动丰富多彩……',
          sort: 0,
          linkUrl: '',
        },
        {
          id: 'c2',
          title: '文体设施',
          body: '镇综合文化站、村级文化礼堂全覆盖……',
          sort: 1,
          linkUrl: '',
        },
      ],
    },
    officePhones: [
      { id: 'ph1', dept: '镇党政办', tel: '0563-1234567', remark: '', sort: 0 },
      { id: 'ph2', dept: '镇农业综合服务中心', tel: '0563-1234568', remark: '', sort: 1 },
      { id: 'ph3', dept: '镇社会事务办', tel: '0563-1234569', remark: '', sort: 2 },
      { id: 'ph4', dept: '镇村镇建设办', tel: '0563-1234570', remark: '', sort: 3 },
      { id: 'ph5', dept: '镇综合执法队', tel: '0563-1234571', remark: '', sort: 4 },
    ],
    villages: [
      {
        id: 'v1',
        name: '阳光村',
        address: '阳光镇阳光村村委会（阳光大道128号）',
        phone: '0563-8801001',
        fullPhone: '05638801001',
        summary: '镇区所在地，基础设施完善，是全镇政治经济文化中心。',
        intro: '阳光村位于阳光镇镇区核心，辖12个村民组，户籍人口约2800人。近年来，村两委围绕"党建引领、产业兴旺、生态宜居"目标，持续推进人居环境整治与公共服务提升。村内建有标准化村部、文化礼堂、便民服务中心，群众办事更加方便。',
        industries: [
          { name: '优质稻米', desc: '依托高标准农田，种植“阳光香米”500余亩，实行统一育秧、统一收割、统一销售。' },
          { name: '乡村旅游', desc: '发展农家乐、采摘园等业态，带动周边就业。' },
        ],
        leadership: [
          { name: '周建国', title: '党支部书记、村委会主任', phone: '0563-8801001', duty: '主持村两委全面工作，负责党建、乡村振兴与集体经济发展。' },
          { name: '吴秀芳', title: '副书记', phone: '0563-8801002', duty: '分管组织宣传、妇联、共青团及文明创建。' },
          { name: '陈志强', title: '村委会副主任', phone: '0563-8801003', duty: '分管农业、水利、人居环境与安全生产。' },
        ],
        sort: 0,
        enabled: true,
      },
      {
        id: 'v2',
        name: '和平村',
        address: '阳光镇和平村村委会（和平路66号）',
        phone: '0563-8802001',
        fullPhone: '05638802001',
        summary: '高山茶园闻名，生态宜居，是全镇茶叶产业核心村。',
        intro: '和平村地处镇域东部山区，海拔600—900米，气候温润，适宜茶树生长。全村8个村民组，常住人口约1600人。村两委坚持“以茶兴村、以旅促茶”，打造“和平绿茶”区域品牌。',
        industries: [
          { name: '高山绿茶', desc: '有机茶园1200亩，年产干茶8万斤，建有茶叶加工车间与品鉴中心。' },
          { name: '茶旅融合', desc: '推出采茶体验、制茶研学路线，与周边民宿联动，延长产业链。' },
        ],
        leadership: [
          { name: '林德明', title: '党支部书记、村委会主任', phone: '0563-8802001', duty: '主持村两委工作，负责茶叶产业规划与对外合作。' },
          { name: '黄小兰', title: '副书记', phone: '0563-8802002', duty: '分管财务、民政、社保与群众诉求办理。' },
          { name: '张海涛', title: '村委会副主任', phone: '0563-8802003', duty: '分管茶园管理、道路建设与森林防火。' },
        ],
        sort: 1,
        enabled: true,
      },
      {
        id: 'v3',
        name: '建设村',
        address: '阳光镇建设村村委会（建设组18号）',
        phone: '0563-8803001',
        fullPhone: '05638803001',
        summary: '劳务输出与小型机械服务活跃，是全镇用工信息集中发布村之一。',
        intro: '建设村位于镇域西北部，辖10个村民组，户籍人口约2100人。村内青壮年劳动力较多，从事建筑、装修、机械作业等行业。村两委积极对接镇劳务信息公示平台，帮助村民就近就业或有序外出务工。',
        industries: [
          { name: '劳务服务', desc: '常年组织建筑、装修、保洁等灵活用工，与镇内企业建立稳定合作关系。' },
          { name: '小型机械', desc: '挖掘机、运输车等农机服务覆盖周边3个村，实行持证备案、明码标价。' },
        ],
        leadership: [
          { name: '刘大伟', title: '党支部书记、村委会主任', phone: '0563-8803001', duty: '主持村两委工作，负责劳务组织与集体资产监管。' },
          { name: '王秀梅', title: '副书记', phone: '0563-8803002', duty: '分管综治、信访、网格化治理。' },
          { name: '赵强', title: '村委会副主任', phone: '0563-8803003', duty: '分管机械服务备案、道路养护与应急抢险。' },
        ],
        sort: 2,
        enabled: true,
      },
      {
        id: 'v4',
        name: '丰收村',
        address: '阳光镇丰收村村委会（丰收大道88号）',
        phone: '0563-8804001',
        fullPhone: '05638804001',
        summary: '合作社模式成熟，生态香米与果蔬种植规模居全镇前列。',
        intro: '丰收村地处镇域南部平原，地势平坦、水源充足，是全镇粮食生产功能区。2018年成立丰收村种植合作社，统一品种、统一种植、统一销售，带动农户增收。',
        industries: [
          { name: '生态香米', desc: '绿色认证水稻800亩，合作社统一加工包装，销往县城及周边乡镇。' },
          { name: '设施果蔬', desc: '大棚蔬菜120亩，供应镇区农贸市场，淡季反季种植效益显著。' },
        ],
        leadership: [
          { name: '孙国华', title: '党支部书记、村委会主任', phone: '0563-8804001', duty: '主持村两委工作，兼任合作社理事长。' },
          { name: '李春花', title: '副书记', phone: '0563-8804002', duty: '分管农业技术推广、妇女工作与家庭农场培育。' },
          { name: '马文斌', title: '村委会副主任', phone: '0563-8804003', duty: '分管合作社运营、仓储物流与农产品质量监管。' },
        ],
        sort: 3,
        enabled: true,
      },
      {
        id: 'v5',
        name: '红星村',
        address: '阳光镇红星村村委会（红星路36号）',
        phone: '0563-8805001',
        fullPhone: '05638805001',
        summary: '中蜂养殖与野花蜜加工特色明显，红色文化资源较为丰富。',
        intro: '红星村位于镇域西南部丘陵地带，生态环境优良，森林覆盖率高。村内保留有红色文化资源，近年来发展林下中蜂养殖，形成“养蜂+蜜制品+电商”链条。',
        industries: [
          { name: '中蜂养殖', desc: '标准化蜂场35户，年产蜂蜜1.2万斤，注册“红星蜜”商标。' },
          { name: '红色文旅', desc: '整理村史资料，开发红色研学路线，与镇综合文化站联动开展主题活动。' },
        ],
        leadership: [
          { name: '郑永红', title: '党支部书记、村委会主任', phone: '0563-8805001', duty: '主持村两委工作，负责红色文化保护与蜂产业协调。' },
          { name: '钱丽娟', title: '副书记', phone: '0563-8805002', duty: '分管宣传、文旅活动组织与电商销售培训。' },
          { name: '胡建军', title: '村委会副主任', phone: '0563-8805003', duty: '分管林业、蜂场防疫与村道亮化工程。' },
        ],
        sort: 4,
        enabled: true,
      },
    ],
    home: {
      promoVideoSectionTitle: '阳光镇风采',
      banners: [
        {
          id: 'fb1',
          imageUrl: '',
          title: '2026年春耕备耕惠农政策公告',
          tag: '重要通知',
          sort: 0,
          linkType: 'policy',
          linkTargetId: 'p1',
        },
        {
          id: 'fb2',
          imageUrl: '',
          title: '阳光镇四季风光欢迎您',
          tag: '',
          sort: 1,
          linkType: 'announcement',
          linkTargetId: 'n1',
        },
      ],
      promoVideos: [
        {
          id: 'fv1',
          coverUrl: '',
          videoUrl: '',
          title: '阳光镇四季风光宣传片',
          duration: '02:35',
          sort: 0,
        },
        {
          id: 'fv2',
          coverUrl: '',
          videoUrl: '',
          title: '乡村振兴建设成果展示',
          duration: '01:48',
          sort: 1,
        },
        {
          id: 'fv3',
          coverUrl: '',
          videoUrl: '',
          title: '本地特色农产品介绍',
          duration: '03:12',
          sort: 2,
          linkUrl: '/pages/mall/index',
        },
      ],
      announcementPreviewCount: 5,
      showAnnouncementMore: true,
      moduleVisibility: {
        affairs: true,
        services: true,
        jobs: true,
        mall: true,
        leadership: true,
        culture: true,
        phones: true,
      },
      townSwitchMode: 'demo_list',
    },
    applyFormTemplate: [],
    legal: {
      agreement: '用户协议正文（后台可维护）',
      privacy: '隐私政策正文（后台可维护）',
    },
  }
  return JSON.stringify(o)
}
