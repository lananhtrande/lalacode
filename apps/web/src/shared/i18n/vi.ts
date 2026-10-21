// Mọi chuỗi hiển thị nằm ở đây (xem docs/conventions.md §UI & văn bản).
// Giọng văn: xưng "mình", gọi trẻ là "em"; câu ngắn, thân thiện.
export const vi = {
  app: {
    name: 'lalacode',
    tagline: 'Học Python bằng tiếng Việt, mỗi ngày 15 phút.',
  },
  nav: {
    skipToContent: 'Tới nội dung chính',
    menu: 'Menu chính',
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
      'lalacode không thu thập thông tin cá nhân của trẻ: không tài khoản, không quảng cáo, không theo dõi.',
    forParentsLink: 'Đọc trang giới thiệu & quyền riêng tư',
  },
  comingSoon: {
    badge: 'Đang xây',
    body: 'Phần này mình đang làm. Em quay lại sau nhé!',
    backHome: 'Về trang chủ',
  },
  pages: {
    map: 'Bản đồ nhiệm vụ',
    lesson: 'Bài học',
    exercise: 'Bài tập',
    badges: 'Huy hiệu',
    report: 'Báo cáo cho bố mẹ',
    about: 'Giới thiệu & quyền riêng tư',
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
