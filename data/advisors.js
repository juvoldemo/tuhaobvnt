export const advisors = {
  nguyenhoangvu: {
    slug: 'nguyenhoangvu',
    name: 'Nguyễn Hoàng Vũ',
    nameLines: ['Nguyễn', 'Hoàng Vũ'],
    role: 'Tư vấn viên cấp cao',
    region: 'Bảo Việt Nhân Thọ Khánh Hòa',
    location: 'Nha Trang, Khánh Hòa',
    phone: '0357 579 713',
    zalo: '0357 579 713',
    email: 'nguyenhoangvub@baoviet.com.vn',
    portrait: '/assets/nguyenhoangvu-removebg-preview.png',
    experience: '5',
    clients: '120',
    retention: '98%',
    contracts: '150+',
    award: '5 năm Sao Việt',
    bio: 'Hơn 5 năm gắn bó với nghề, tôi luôn đặt chữ TÂM lên hàng đầu. Mỗi giải pháp tôi mang đến không chỉ là một hợp đồng bảo hiểm mà còn là sự an tâm và giá trị bền vững cho bạn và gia đình.'
  }
};

export const getAdvisor = (slug) => advisors[slug];
