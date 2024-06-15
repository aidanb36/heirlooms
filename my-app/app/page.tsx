import { DataTableDemo } from "./table/table";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-between px-4 sm:px-0">
      <h1 className="text-2xl mb-4 text-center">heirloom collection</h1>
      <div className="w-full overflow-x-auto">
        <DataTableDemo />
      </div>
    </div>
  );
}
