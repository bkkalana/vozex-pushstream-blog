import type { Metadata } from "next";
export const metadata:Metadata={title:{default:"Admin",template:"%s | PushStream Admin"},robots:{index:false,follow:false,nocache:true}};
export default function AdminRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {return children;}
