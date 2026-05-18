type NavBarProps = {
  title?: string;
};
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
export default function NavBar({ title }: NavBarProps) {
  const navigate = useNavigate();
  return (
    <nav className="relative h-13.5 w-full border-b border-primary py-2 md:hidden">
      <span
        className="absolute top-2 left-2 cursor-pointer"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="size-9" />
      </span>
      <p className="text-center text-2xl leading-9.5">{title}</p>
    </nav>
  );
}
