// Mọi chuỗi hiển thị nằm ở đây (xem docs/conventions.md §UI & văn bản).
// Giọng văn: xưng "mình", gọi trẻ là "em"; câu ngắn, thân thiện.
export const vi = {
  app: {
    name: 'lalakode',
    contactEmail: 'hello@teacherkit.help',
    tagline: 'Học Python bằng tiếng Việt, mỗi ngày 15 phút.',
  },
  nav: {
    skipToContent: 'Tới nội dung chính',
    menu: 'Menu chính',
    openMenu: 'Mở menu',
    closeMenu: 'Đóng menu',
    home: 'Trang chủ',
    map: 'Bản đồ',
    badges: 'Huy hiệu',
    about: 'Giới thiệu',
  },
  home: {
    heroTitle: 'Viết dòng code Python đầu tiên ngay hôm nay',
    heroLead:
      'Mỗi bài chỉ 15 phút: đọc một chút, rồi tự viết code và chạy thử ngay trên trình duyệt. Không cần cài gì cả.',
    startLearning: 'Bắt đầu học',
    seeMap: 'Xem bản đồ nhiệm vụ',
    pointsTitle: 'Học ở đây có gì vui?',
    points: [
      {
        title: 'Chạy code ngay trên trình duyệt',
        body: 'Python thật chạy trong máy của em. Bấm Chạy là thấy kết quả, sai thì sửa rồi thử lại.',
      },
      {
        title: 'Chấm bài và chỉ chỗ sai',
        body: 'Mình kiểm tra bài của em và nói rõ chỗ nào chưa đúng bằng tiếng Việt, không chê bai.',
      },
      {
        title: 'Vẽ hình bằng code',
        body: 'Dùng rùa turtle vẽ ngôi sao, bông hoa, lá cờ — code chạy tới đâu thấy hình tới đó.',
      },
      {
        title: 'Tiến độ nằm trong máy em',
        body: 'Không cần tài khoản, không cần email. Bài em làm được lưu ngay trên máy này.',
      },
    ],
    forParentsTitle: 'Bố mẹ muốn tìm hiểu?',
    forParentsBody:
      'lalakode không thu thập thông tin cá nhân của trẻ: không tài khoản, không quảng cáo, không theo dõi.',
    forParentsLink: 'Đọc trang dành cho bố mẹ',
  },
  map: {
    title: 'Bản đồ nhiệm vụ',
    lead: 'Chọn một bài để bắt đầu. Mỗi bài khoảng 15 phút.',
    done: 'Xong',
    exercisesDone: 'bài tập đã xong',
    continueLesson: 'Học tiếp',
    startLesson: 'Bắt đầu',
    loading: 'Đang tải danh sách bài học…',
    error: 'Chưa tải được danh sách bài học. Em thử tải lại trang nhé.',
    empty: 'Chưa có bài học nào. Mình đang viết, em quay lại sau nhé!',
    minutes: 'phút',
    exercises: 'bài tập',
    draftBadge: 'Bản nháp',
  },
  lesson: {
    loading: 'Đang mở bài học…',
    notFound: 'Không tìm thấy bài học này.',
    backToMap: 'Về bản đồ nhiệm vụ',
    minutes: 'phút',
    conceptsTitle: 'Bài này học gì',
    videoTitle: 'Video bài học',
    // Bấm mới tải: trước khi em bấm thì YouTube không biết em mở trang này.
    videoPlay: 'Xem video',
    videoNote: 'Bấm nút thì video mới được tải từ YouTube.',
    videoMinutes: 'phút',
    exercisesTitle: 'Bài tập',
    exercisesLead: 'Làm lần lượt từ trên xuống nhé.',
    exerciseDone: 'Xong',
    exerciseDoing: 'Đang làm',
    startFirst: 'Bắt đầu làm bài',
    continueNext: 'Làm tiếp bài chưa xong',
    allDone: 'Em làm xong hết bài học này rồi. Giỏi quá!',
    nextLesson: 'Sang bài tiếp theo',
  },
  exercise: {
    loading: 'Đang mở bài tập…',
    notFound: 'Không tìm thấy bài tập này.',
    backToMap: 'Về bản đồ nhiệm vụ',
    yourCode: 'Code của em',
    run: 'Chạy thử',
    running: 'Đang chạy…',
    submit: 'Nộp bài',
    grading: 'Đang chấm…',
    stop: 'Dừng',
    reset: 'Làm lại từ đầu',
    restored: 'Mình giữ lại bài em đang làm dở',
    resetConfirm: 'Xoá code hiện tại và quay về code ban đầu nhé?',
    outputTitle: 'Kết quả chạy',
    promptMore: 'Xem cả đề bài',
    promptLess: 'Thu gọn đề bài',
    outputEmpty: 'Bấm "Chạy thử" để xem chương trình in ra gì.',
    drawingTitle: 'Hình rùa vẽ',
    preparing: 'Đang chuẩn bị Python…',
    ready: 'Python sẵn sàng',
    testsTitle: 'Kết quả chấm',
    testPassed: 'Đạt',
    testFailed: 'Chưa đạt',
    testNumber: 'Test',
    allPassed: 'Tuyệt vời, em làm đúng hết rồi!',
    somePassed: 'Gần được rồi. Em xem lại phần chưa đạt nhé.',
    errorTitle: 'Chương trình dừng lại',
    errorLine: 'Dòng',
    showRaw: 'Xem lỗi gốc',
    hintsTitle: 'Gợi ý',
    askAi: 'Hỏi trợ giúp',
    askAiAgain: 'Xin gợi ý rõ hơn',
    asking: 'Đang nghĩ…',
    aiLabel: 'Trợ lý nói',
    savedLabel: 'Gợi ý có sẵn',
    // Bộ lọc phía server không bắt được tên viết trơ trọi (xem docs/privacy.md),
    // nên phải nhắc trẻ trước khi gửi code đi.
    privacyWarning:
      'Trước khi hỏi: code của em sẽ được gửi đi để nhờ trợ lý xem giúp. Em đừng viết tên thật, địa chỉ hay số điện thoại trong code nhé.',
    aiOff: 'Hôm nay trợ lý đang nghỉ. Em xem gợi ý có sẵn bên dưới nhé.',
    aiOutOfTurns: 'Em đã hỏi đủ số lần hôm nay rồi. Đây là gợi ý có sẵn, mai hỏi tiếp nhé.',
    aiBusyToday: 'Trợ lý đang bận với các bạn khác. Em xem gợi ý có sẵn nhé.',
    aiBroken: 'Trợ lý chưa trả lời được. Em xem gợi ý có sẵn nhé.',
    showHint: 'Mở gợi ý',
    nextHint: 'Gợi ý tiếp theo',
    hintNumber: 'Gợi ý',
  },
  runner: {
    timeout:
      'Code chạy lâu quá rồi. Có thể em viết một vòng lặp không bao giờ dừng. Mình đã dừng giúp em, sửa lại rồi chạy tiếp nhé.',
    cancelled: 'Mình đã dừng chương trình. Em sửa code rồi chạy lại nhé.',
    internal: 'Máy chạy Python gặp trục trặc. Em thử tải lại trang giúp mình nhé.',
  },
  streak: {
    none: 'Hôm nay em học một bài nhé, chuỗi ngày sẽ bắt đầu từ hôm nay.',
    days: 'ngày học liên tiếp',
    keepGoing: 'Giữ chuỗi nhé!',
  },
  badges: {
    title: 'Huy hiệu',
    lead: 'Mỗi huy hiệu ghi lại một cố gắng của em.',
    earned: 'Đã nhận',
    locked: 'Chưa nhận',
    progress: 'Tiến trình',
    seeAll: 'Xem tất cả huy hiệu',
    countEarned: 'huy hiệu đã nhận',
    items: {
      'bai-dau-tien': {
        name: 'Bài đầu tiên',
        how: 'Làm xong một bài tập bất kỳ.',
      },
      'nam-bai-tap': {
        name: 'Năm bài liền tay',
        how: 'Làm xong 5 bài tập.',
      },
      'xong-bai-hoc': {
        name: 'Trọn một bài học',
        how: 'Làm xong tất cả bài tập của một bài học.',
      },
      'ba-ngay-lien': {
        name: 'Ba ngày liên tiếp',
        how: 'Học 3 ngày liền nhau.',
      },
      'bay-ngay-lien': {
        name: 'Bảy ngày liên tiếp',
        how: 'Học 7 ngày liền nhau.',
      },
      'kien-tri': {
        name: 'Không bỏ cuộc',
        how: 'Thử lại nhiều lần rồi làm đạt một bài tập.',
      },
    },
  },
  progressCode: {
    title: 'Mã tiến độ',
    lead: 'Mã này giúp em mang bài đã học sang máy khác. Không cần tài khoản, không ai khác xem được nếu em không đưa mã cho họ.',
    yourCode: 'Mã của em',
    copy: 'Sao chép mã',
    copied: 'Đã sao chép',
    nothingYet: 'Em chưa học bài nào nên chưa có gì để mang đi.',
    importTitle: 'Nhập mã từ máy khác',
    importLead: 'Dán mã vào đây rồi bấm Nhập. Bài em đã học ở máy này vẫn được giữ.',
    importLabel: 'Dán mã tiến độ',
    importButton: 'Nhập mã',
    importDone: 'Xong! Tiến độ đã được gộp vào máy này.',
    importBadCode: 'Mã này mình đọc không được. Em kiểm tra xem đã sao chép đủ chưa nhé.',
    importTooNew: 'Mã này tạo bởi phiên bản lalakode mới hơn. Em cập nhật trang rồi thử lại nhé.',
    privacyNote:
      'Mã không chứa những dòng code em viết. Nó chỉ ghi bài nào xong, bài nào đang làm, số lần em thử và huy hiệu đã nhận.',
  },
  report: {
    title: 'Báo cáo cho bố mẹ',
    // Trang này bố mẹ đọc, nên xưng hô khác với các trang dành cho trẻ.
    lead: 'Đây là tóm tắt việc học của con, đọc từ chính đường link bạn đang mở. Trang không gửi dữ liệu này đi đâu cả.',
    emptyTitle: 'Chưa có dữ liệu trong link',
    emptyLead:
      'Link báo cáo cần phần mã ở sau dấu #. Bạn hãy mở lại đúng đường link con gửi, hoặc tạo link mới ngay trên máy con.',
    badLink: 'Link này mình đọc không được. Có thể lúc sao chép bị thiếu một phần ở cuối.',
    createTitle: 'Tạo link báo cáo',
    createLead:
      'Bấm nút để tạo link từ tiến độ trên máy này, rồi gửi cho bố mẹ qua Zalo hay tin nhắn.',
    createButton: 'Tạo link báo cáo',
    createNothing: 'Em làm xong một bài tập rồi quay lại đây để tạo link nhé.',
    copy: 'Sao chép link',
    copied: 'Đã sao chép',
    stats: {
      exercises: 'bài tập đã xong',
      lessons: 'bài học trọn vẹn',
      streak: 'ngày học liên tiếp',
      badges: 'huy hiệu',
      attempts: 'lần nộp bài',
      lastActive: 'Học gần nhất',
    },
    lessonsTitle: 'Từng bài học',
    lessonDone: 'Xong',
    lessonDoing: 'Đang làm',
    noLessons: 'Con chưa bắt đầu bài nào.',
    privacyTitle: 'Về dữ liệu trong link này',
    privacyBody:
      'Toàn bộ số liệu nằm sau dấu # trong đường link, nên trình duyệt không gửi nó lên máy chủ. Link không chứa họ tên, email hay số điện thoại, và cũng không chứa những dòng code con viết.',
    honestyNote:
      'Link này chỉ để bố mẹ theo dõi cho vui. Nó không có cách xác thực ai tạo ra, nên đừng dùng làm căn cứ chấm điểm.',
    attemptsNote: 'Số lần nộp bài cho thấy con thử lại bao nhiêu lần — thử nhiều là chuyện tốt.',
  },
  deleteData: {
    title: 'Xoá toàn bộ dữ liệu trên máy này',
    lead: 'Xoá sạch bài đã xong, huy hiệu, chuỗi ngày học và code em đang viết dở trên máy này.',
    warning: 'Xoá rồi là không lấy lại được.',
    saveFirst: 'Muốn giữ lại thì sao chép mã tiến độ ở trên trước khi xoá nhé.',
    button: 'Xoá dữ liệu',
    confirmQuestion: 'Em chắc chắn muốn xoá hết chứ?',
    confirmYes: 'Đúng, xoá hết',
    confirmNo: 'Thôi, giữ lại',
    done: 'Đã xoá xong. Máy này giờ sạch như lúc mới bắt đầu.',
  },
  // Hai trang dưới đây bố mẹ đọc, không phải trẻ: xưng "mình" với "bạn", câu
  // dài hơn được, nhưng vẫn không dùng từ chuyên môn chưa giải thích.
  about: {
    title: 'lalakode là gì?',
    lead: 'lalakode dạy trẻ 10–15 tuổi viết Python bằng tiếng Việt. Mỗi bài khoảng 15 phút: đọc một đoạn ngắn, rồi tự viết code và chạy thử ngay trong trình duyệt. Không cần cài phần mềm, không cần tài khoản.',
    howTitle: 'Con học như thế nào?',
    how: [
      {
        title: 'Đọc ngắn, làm nhiều',
        body: 'Mỗi bài chỉ dạy một ý mới, rồi 3–5 bài tập để con tự làm. Phần lớn thời gian là con gõ code, không phải ngồi xem.',
      },
      {
        title: 'Máy chấm và chỉ chỗ chưa đúng',
        body: 'Con bấm Nộp bài, máy chạy thử code rồi nói bằng tiếng Việt chỗ nào chưa đạt. Không chấm điểm, không xếp hạng, không chê bai.',
      },
      {
        title: 'Sai bao nhiêu lần cũng được',
        body: 'Số lần thử lại được ghi lại như một điều đáng khen, không phải điểm trừ. Có huy hiệu riêng cho việc kiên trì làm lại.',
      },
      {
        title: 'Vẽ hình bằng code',
        body: 'Con dùng "rùa" turtle để vẽ ngôi sao, bông hoa, hoa văn. Thấy hình hiện ra thì học dễ vào hơn nhiều.',
      },
    ],
    pythonTitle: 'Python chạy ở đâu?',
    pythonBody:
      'Ngay trong trình duyệt trên máy của con, bằng một bản Python thật (Pyodide). Code con viết không được gửi lên máy chủ nào để chạy. Lần đầu mở bài tập máy cần tải Python về nên hơi lâu, những lần sau là nhanh.',
    stageTitle: 'Dự án đang ở đâu',
    stageBody:
      'Đây là giai đoạn thử nghiệm. Khoá "Python khởi động" có 20 bài, tất cả còn là bản nháp và sẽ còn sửa theo phản hồi của các gia đình dùng thử. Hiện tại dùng miễn phí.',
    stageHonest:
      'Nói thật để bạn khỏi kỳ vọng nhầm: nội dung chưa qua thẩm định của hội đồng chuyên môn nào, và vì không có tài khoản nên nếu con đổi máy hoặc xoá dữ liệu trình duyệt thì tiến độ sẽ mất, trừ khi con tự lưu mã tiến độ.',
    parentsTitle: 'Bố mẹ theo dõi bằng cách nào?',
    parentsBody:
      'Con tự tạo một đường link báo cáo trên máy mình rồi gửi cho bạn. Link đó chỉ hiện số bài đã xong, số ngày học liên tiếp và huy hiệu — không có họ tên, không có code con viết. Mọi số liệu nằm ngay trong đường link, không có máy chủ nào lưu.',
    parentsLink: 'Xem trang báo cáo',
    contactTitle: 'Hỏi thêm',
    contactBody:
      'Có gì chưa rõ, bạn viết thư cho mình. Trong giai đoạn thử nghiệm, bạn cũng có thể nhắn trong nhóm mà gia đình mình đã tham gia. lalakode không có ô nào trên web để thu email hay số điện thoại của bạn hoặc của con.',
    privacyLink: 'Đọc trang quyền riêng tư',
  },
  privacy: {
    title: 'Quyền riêng tư',
    updated: 'Cập nhật ngày 22/10/2026',
    lead: 'Tóm tắt một câu: lalakode không có tài khoản và không lưu thông tin cá nhân của con trên máy chủ. Mọi thứ con học nằm trong trình duyệt trên máy của gia đình.',
    whereTitle: 'Dữ liệu nằm ở đâu',
    whereIntro: 'Đây là toàn bộ những gì lalakode giữ, và giữ ở đâu:',
    rowLabels: {
      where: 'Nằm ở đâu',
      sent: 'Có rời khỏi máy không?',
    },
    rows: [
      {
        what: 'Bài đã xong, số lần thử, chuỗi ngày học, huy hiệu',
        where: 'Trong trình duyệt trên máy của con (IndexedDB)',
        sent: 'Không',
      },
      {
        what: 'Những dòng code con đang viết dở',
        where: 'Trong trình duyệt trên máy của con',
        sent: 'Không — trừ khi con tự bấm "Hỏi trợ giúp" (xem bên dưới)',
      },
      {
        what: 'Biệt danh con tự đặt (tuỳ chọn, hiện chưa có ô nhập nào trên web)',
        where: 'Trong trình duyệt trên máy của con',
        sent: 'Không — nhưng nếu sau này có ô nhập thì biệt danh sẽ nằm trong mã tiến độ con gửi đi',
      },
      {
        what: 'Mã tiến độ và link báo cáo',
        where: 'Con tự sao chép rồi tự gửi cho ai con muốn',
        sent: 'Không',
      },
      {
        what: 'Một dãy ký tự ngẫu nhiên để đếm số lượt hỏi trợ giúp',
        where: 'Trên máy con; máy chủ chỉ giữ bản mã hoá của nó trong 48 giờ',
        sent: 'Có — nhưng nó không gắn với tên tuổi ai cả',
      },
    ],
    noAccountTitle: 'Không có chỗ nào hỏi thông tin của con',
    noAccountBody:
      'Không đăng ký, không đăng nhập, không ô nhập họ tên, ngày sinh, trường lớp, email hay số điện thoại. Không có ảnh, không có giọng nói. lalakode cũng không biết con là ai.',
    aiTitle: 'Khi con bấm "Hỏi trợ giúp"',
    aiBody:
      'Đây là lần duy nhất code của con rời khỏi máy, và chỉ khi chính con bấm nút. Chạy thử và nộp bài hoàn toàn diễn ra trên máy. Lúc hỏi trợ giúp, lalakode gửi đi: mã bài tập, đoạn code trong ô, thông báo lỗi nếu có, và mức gợi ý. Không gửi tên, không gửi tiến độ, không gửi gì nhận ra con.',
    aiProvider:
      'Phần gợi ý do trợ lý Claude của Anthropic trả lời, gọi qua dịch vụ Amazon Bedrock. Dữ liệu có thể được xử lý ở máy chủ ngoài Việt Nam. Đó chính là lý do lalakode tuyệt đối không gửi thông tin cá nhân sang đó.',
    aiNoLog: 'Máy chủ của lalakode không ghi lại nội dung code con gửi.',
    aiNoSolution:
      'Trợ lý được yêu cầu chỉ gợi ý theo ba mức, từ nhẹ tới rõ dần, và không đưa lời giải hoàn chỉnh.',
    aiFilterTitle: 'Bộ lọc, và giới hạn thật của nó',
    aiFilterBody:
      'Nói cho đúng từng chặng: code đi từ máy con tới máy chủ của lalakode nguyên văn (máy chủ không ghi lại nó), rồi máy chủ che email, số điện thoại, dãy số dài, đường link và phần đứng sau những câu kiểu "em tên là…", "nhà ở…" — xong mới chuyển cho AI.',
    aiFilterLimit:
      'Nhưng phải nói thẳng: bộ lọc đoán theo mẫu chứ không hiểu nội dung. Một cái tên viết trơ trọi trong code — ví dụ in ra họ tên thật — vẫn có thể lọt qua. Vì vậy ngay trên màn hình bài tập, trước khi con bấm hỏi lần đầu, lalakode nhắc con đừng viết tên thật, địa chỉ hay số điện thoại vào code. Mong bạn nhắc con thêm một lần.',
    notDoingTitle: 'Những thứ lalakode không làm',
    notDoing: [
      'Không quảng cáo, không bán dữ liệu — không có dữ liệu để bán.',
      'Không cookie theo dõi, không Google Analytics, không Facebook Pixel hay công cụ đo đạc bên thứ ba nào.',
      'Không bảng xếp hạng, không trang công khai liệt kê người học.',
      'Không tải font hay mã nguồn từ máy chủ bên ngoài, nên không bên nào khác biết con đang mở trang này.',
      'Hiện chưa bài học nào có video. Nếu sau này có, lalakode sẽ dùng bản nhúng YouTube không đặt cookie và ghi rõ ở đây.',
    ],
    reportTitle: 'Về link báo cáo và mã tiến độ',
    reportBody:
      'Số liệu nằm sau dấu # trong đường link, mà phần sau dấu # thì trình duyệt không gửi lên máy chủ. Nói cách khác, bạn mở link báo cáo thì không ai ngoài máy bạn thấy nội dung đó.',
    reportLimits: [
      'Phần sau dấu # không đi theo request nào, nhưng tiện ích mở rộng của trình duyệt hoặc tính năng đồng bộ lịch sử vẫn đọc được địa chỉ đang mở. Đây là giới hạn chung của mọi cách giấu dữ liệu sau dấu #. Vì vậy link chỉ chứa thứ không nhạy cảm.',
      'Mã không có chữ ký, nên ai biết cấu trúc đều tự ghép được một báo cáo đẹp. Link này để bạn theo dõi cho vui, đừng dùng làm căn cứ chấm điểm con.',
    ],
    deleteTitle: 'Xoá hết dữ liệu',
    deleteBody:
      'Vào trang Mã tiến độ, bấm "Xoá dữ liệu". Máy sẽ hỏi lại một lần rồi xoá sạch bài đã xong, huy hiệu, chuỗi ngày học và code đang viết dở trên máy này. Xoá xong là không lấy lại được, nên nếu muốn giữ thì sao chép mã tiến độ trước.',
    deleteLink: 'Tới trang Mã tiến độ',
    contactTitle: 'Hỏi mình',
    contactBody: 'Có gì chưa rõ về dữ liệu của con, bạn viết thư cho mình ở địa chỉ này:',
    // Phải nói luôn, kẻo bố mẹ tưởng viết thư là cách duy nhất để xoá dữ liệu.
    contactNote:
      'Khi bạn viết thư thì mình thấy địa chỉ email của bạn — email hoạt động như vậy. Mình chỉ dùng nó để trả lời bạn, không đưa vào danh sách gửi tin nào cả. Còn muốn xoá dữ liệu của con thì không cần viết thư: bấm nút "Xoá dữ liệu" là xong ngay trên máy, vì bên mình không giữ bản sao nào để mà xoá hộ.',
    lawTitle: 'Về pháp luật',
    lawBody:
      'lalakode làm theo hướng thu thập ít nhất có thể, đúng tinh thần Luật Bảo vệ dữ liệu cá nhân 2025 đối với dữ liệu của trẻ em: cách chắc chắn nhất để không làm lộ dữ liệu của con là ngay từ đầu không thu thập nó.',
    backToAbout: 'Về trang giới thiệu',
  },
  comingSoon: {
    badge: 'Đang xây',
    body: 'Phần này mình đang làm. Em quay lại sau nhé!',
    backHome: 'Về trang chủ',
  },
  pages: {
    progressCode: 'Mã tiến độ',
    map: 'Bản đồ nhiệm vụ',
    exercise: 'Bài tập',
    badges: 'Huy hiệu',
    report: 'Báo cáo cho bố mẹ',
  },
  notFound: {
    title: 'Không tìm thấy trang này',
    body: 'Có thể đường dẫn bị gõ nhầm, hoặc trang đã chuyển đi chỗ khác.',
  },
  footer: {
    privacy: 'Quyền riêng tư',
    madeFor: 'Làm cho học sinh Việt Nam',
  },
} as const;
