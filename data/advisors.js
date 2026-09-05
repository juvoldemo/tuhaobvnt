export const advisors = {
  nguyenhoangvu: {
    slug: 'nguyenhoangvu',
    name: 'Nguyễn Hoàng Vũ',
    nameLines: ['Nguyễn', 'Hoàng Vũ'],
    role: 'Tư vấn viên cấp cao',
    region: 'Bảo Việt Nhân Thọ Khánh Hòa',
    location: 'Nha Trang, Khánh Hòa',
    phone: '0988 123 456',
    zalo: '0988 123 456',
    email: 'minhtho.baovietkh@gmail.com',
    portrait: '/assets/nguyenhoangvu-transparent.png',
    experience: '10+',
    clients: '1.000+',
    retention: '98%',
    contracts: '150+',
    award: 'Sao Việt',
    bio: 'Hơn 10 năm gắn bó với nghề, tôi luôn đặt chữ TÂM lên hàng đầu. Mỗi giải pháp tôi mang đến không chỉ là một hợp đồng bảo hiểm mà còn là sự an tâm và giá trị bền vững cho bạn và gia đình.'
  }
};

export const getAdvisor = (slug) => advisors[slug];
