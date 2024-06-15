import { DataTableDemo } from "./table/table";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-between p-8">
      <h1 className="text-xl">heirloom collection</h1>
      <DataTableDemo />
    </div>
  );
}
