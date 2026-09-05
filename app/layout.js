import './globals.css';

export const metadata = {
  title: 'Sao Việt – Tư vấn tài chính & bảo hiểm',
  description: 'Giải pháp tài chính vững vàng cho bạn và gia đình.'
};

export default function RootLayout({ children }) {
  return <html lang="vi"><body>{children}</body></html>;
}
