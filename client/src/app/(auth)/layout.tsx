
import Image from "next/image"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Left side - Form */}
      <div className="flex w-full flex-col justify-center px-4 md:w-1/2 lg:px-8 xl:w-5/12">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
           {children}
        </div>
      </div>
      
      {/* Right side - Image */}
      <div className="hidden w-1/2 bg-muted md:block xl:w-7/12 relative">
        <Image
          src="/images/auth-sidebar.png"
          alt="Authentication background"
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 0vw, 50vw"
        />
        <div className="absolute inset-0 bg-primary/5 mix-blend-overlay dark:bg-primary/10" />
      </div>
    </div>
  )
}
