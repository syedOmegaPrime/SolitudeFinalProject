import Link from 'next/link';
import Logo from '@/components/common/Logo';
import AuthButtons from '@/components/auth/AuthButtons';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

const NavLinks = ({ inSheet = false }: { inSheet?: boolean }) => (
  <>
    <Link href="/marketplace" passHref>
      <Button variant={inSheet ? "ghost" : "link"} className={inSheet ? "w-full justify-start" : "text-foreground hover:text-primary"}>Marketplace</Button>
    </Link>
    <Link href="/forum" passHref>
      <Button variant={inSheet ? "ghost" : "link"} className={inSheet ? "w-full justify-start" : "text-foreground hover:text-primary"}>Forum</Button>
    </Link>
    <Link href="/upload" passHref>
      <Button variant={inSheet ? "ghost" : "link"} className={inSheet ? "w-full justify-start" : "text-foreground hover:text-primary"}>Upload Asset</Button>
    </Link>
  </>
);


const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
          <NavLinks />
        </nav>
        <div className="hidden md:flex items-center">
          <AuthButtons />
        </div>
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col p-6 space-y-4">
                <Logo />
                <nav className="flex flex-col space-y-2 mt-6">
                  <NavLinks inSheet />
                </nav>
                <div className="mt-auto pt-6 border-t">
                  <AuthButtons />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
