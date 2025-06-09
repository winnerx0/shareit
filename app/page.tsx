import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

const page = () => {
	
  return (
    <div className="h-screen pt-24 px-2">
      <div className="flex flex-col gap-4 items-center justify-center h-[400px] ">
        <h1 className="font-bold text-[clamp(50px,5rem,8rem)] ">ShareIt</h1>
        <p className="text-center">A simeple and efficient file sharing platform</p>
        <Link className={buttonVariants({ className: "w-48 h-10" })} href={"/home"} >Get Started</Link>
      </div>
    </div>
  );
};

export default page;
