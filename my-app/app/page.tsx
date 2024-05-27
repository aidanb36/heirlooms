import Image from "next/image";
import { DataTableDemo } from "./table/table";
import { NavigationMenuDemo } from "./nav/nav";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8">
      <div className="flex justify-between w-full">
        {/* Your content or logo */}
        <div> family heirlooms</div>
        <div>
          <NavigationMenuDemo />
        </div>
      </div>
      <h1 className="text-xl"> heirloom collection</h1>
      <DataTableDemo />
    </main>
  );
}
