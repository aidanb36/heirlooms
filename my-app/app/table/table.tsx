"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  Edit,
  Trash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";

export type Payment = {
  _id?: string;
  title: string;
  assign: "unknown" | "aidan" | "madeline" | "mom" | "dad";
  description: string;
  image: string;
};

export const columns: ColumnDef<Payment>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "assign",
    header: "assign",
    cell: ({ row }) => <div className="">{row.getValue("assign")}</div>,
  },
  {
    accessorKey: "title",
    header: "title",
    cell: ({ row }) => <div className="">{row.getValue("title")}</div>,
  },
  {
    accessorKey: "description",
    header: "description",
    cell: ({ row }) => <div className="">{row.getValue("description")}</div>,
    enableHiding: true,
  },
  {
    accessorKey: "image",
    header: "image",
    cell: ({ row }) => <div className="">{row.getValue("image")}</div>,
  },
];

export function DataTableDemo() {
  const [data, setData] = useState<Payment[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingRow, setEditingRow] = React.useState<Payment | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(5);

  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newHeirloom, setNewHeirloom] = useState<Payment>({
    title: "",
    assign: "unknown",
    description: "",
    image: "",
  });

  const handleDialogChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewHeirloom((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDialogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/heirlooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newHeirloom),
      });
      fetchData();
      setIsDialogOpen(false);
      setNewHeirloom({
        title: "",
        assign: "unknown",
        description: "",
        image: "",
      });
    } catch (error) {
      console.error("Error adding heirloom:", error);
    }
  };

  const handleCellClick = (row: Payment, columnId: string) => {
    setIsEditing(true);
    setEditingRow(row);
    setEditingCell(columnId);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setColumnVisibility({ description: false });
      } else {
        setColumnVisibility({ description: true });
      }
    };

    handleResize(); // Call initially

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/heirlooms?all=true");
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error("Error fetching heirlooms:", error);
    }
  };

  const handleEdit = (row: Payment) => {
    setIsEditing(true);
    setEditingRow(row);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/heirlooms?id=${id}`, {
        method: "DELETE",
      });
      fetchData();
    } catch (error) {
      console.error("Error deleting heirloom:", error);
    }
  };

  const handleSave = async () => {
    if (editingRow) {
      try {
        await fetch(`/api/heirlooms?id=${editingRow._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editingRow),
        });
        setIsEditing(false);
        setEditingRow(null);
        fetchData();
      } catch (error) {
        console.error("Error updating heirloom:", error);
      }
    }
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    rowIndex: number
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSizeInBytes = 1 * 1024 * 1024; // 1MB in bytes
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          let width = img.width;
          let height = img.height;

          // Adjust the image dimensions while maintaining the aspect ratio
          if (width > height) {
            if (width > 800) {
              height *= 800 / width;
              width = 800;
            }
          } else {
            if (height > 800) {
              width *= 800 / height;
              height = 800;
            }
          }

          canvas.width = width;
          canvas.height = height;

          ctx?.drawImage(img, 0, 0, width, height);

          let quality = 0.9; // Initial quality value

          const adjustQuality = () => {
            canvas.toBlob(
              (blob) => {
                if (blob && blob.size > maxSizeInBytes) {
                  quality -= 0.1;
                  if (quality < 0.1) {
                    alert(
                      "Image compression failed. Please select a smaller image."
                    );
                    return;
                  }
                  adjustQuality();
                } else {
                  const imageDataUrl = canvas.toDataURL("image/jpeg", quality);
                  setEditingRow((prevRow) => {
                    if (prevRow) {
                      return {
                        ...prevRow,
                        image: imageDataUrl,
                      };
                    }
                    return null;
                  });
                }
              },
              "image/jpeg",
              quality
            );
          };

          adjustQuality();
        };
      };

      reader.readAsDataURL(file);
    }
  };
  const handleCancel = () => {
    setIsEditing(false);
    setEditingRow(null);
  };

  const handleCellChange = (
    rowIndex: number,
    columnId: string,
    value: string
  ) => {
    setEditingRow((prevRow) => {
      if (prevRow) {
        return {
          ...prevRow,
          [columnId]: value,
        };
      }
      return null;
    });
  };

  const handleAddRow = async () => {
    const newHeirloom: Payment = {
      title: "",
      assign: "unknown",
      description: "",
      image: "",
    };

    try {
      await fetch("/api/heirlooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newHeirloom),
      });
      fetchData();
    } catch (error) {
      console.error("Error adding heirloom:", error);
    }
  };

  const handleDialogImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSizeInBytes = 1 * 1024 * 1024; // 1MB in bytes
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          let width = img.width;
          let height = img.height;

          // Adjust the image dimensions while maintaining the aspect ratio
          if (width > height) {
            if (width > 800) {
              height *= 800 / width;
              width = 800;
            }
          } else {
            if (height > 800) {
              width *= 800 / height;
              height = 800;
            }
          }

          canvas.width = width;
          canvas.height = height;

          ctx?.drawImage(img, 0, 0, width, height);

          let quality = 0.9; // Initial quality value

          const adjustQuality = () => {
            canvas.toBlob(
              (blob) => {
                if (blob && blob.size > maxSizeInBytes) {
                  quality -= 0.1;
                  if (quality < 0.1) {
                    alert(
                      "Image compression failed. Please select a smaller image."
                    );
                    return;
                  }
                  adjustQuality();
                } else {
                  const imageDataUrl = canvas.toDataURL("image/jpeg", quality);
                  setNewHeirloom((prev) => ({
                    ...prev,
                    image: imageDataUrl,
                  }));
                }
              },
              "image/jpeg",
              quality
            );
          };

          adjustQuality();
        };
      };

      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = (imageUrl: string) => {
    setExpandedImage(imageUrl);
  };

  const handleCloseExpandedImage = () => {
    setExpandedImage(null);
  };

  const table = useReactTable({
    data,
    columns: [
      ...columns,
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const payment = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(payment)}>
                  <Edit className="mr-2 h-4 w-4" />
                  edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDelete(payment._id as any)}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter Entries"
          value={table.getColumn("title")?.getFilterValue() as string}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className=""
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border overflow-x-auto">
        <div className="min-w-full">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {isEditing && editingRow?._id === row.original._id ? (
                          cell.column.id === "assign" ? (
                            <select
                              //@ts-ignore
                              value={editingRow[cell.column.id]}
                              onChange={(e) =>
                                handleCellChange(
                                  row.index,
                                  cell.column.id,
                                  e.target.value
                                )
                              }
                            >
                              <option value="unknown">Unknown</option>
                              <option value="aidan">aidan</option>
                              <option value="madeline">madeline</option>
                              <option value="mom">mom</option>
                              <option value="dad">dad</option>
                            </select>
                          ) : cell.column.id === "image" ? (
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageChange(e, row.index)}
                            />
                          ) : (
                            <Input
                              //@ts-ignore
                              value={editingRow[cell.column.id]}
                              onChange={(e) =>
                                handleCellChange(
                                  row.index,
                                  cell.column.id,
                                  e.target.value
                                )
                              }
                            />
                          )
                        ) : cell.column.id === "image" ? (
                          <img
                            src={cell.getValue() as string}
                            alt="Heirloom Image"
                            className="h-12 w-12 cursor-pointer object-cover"
                            onClick={() =>
                              handleImageClick(cell.getValue() as string)
                            }
                          />
                        ) : (
                          flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        {isEditing ? (
          <>
            <Button variant="outline" size="sm" onClick={handleCancel}>
              cancel
            </Button>
            <Button variant="default" size="sm" onClick={handleSave}>
              save
            </Button>
          </>
        ) : (
          <>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  add row
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Add New Heirloom</DialogTitle>
                <DialogDescription>
                  Fill in the details for the new heirloom.
                </DialogDescription>
                <form onSubmit={handleDialogSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="title">Title</label>
                      <Input
                        id="title"
                        name="title"
                        value={newHeirloom.title}
                        onChange={handleDialogChange}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="assign">Assign</label>
                      <Select
                        name="assign"
                        value={newHeirloom.assign}
                        onValueChange={(value) =>
                          handleDialogChange({
                            target: { name: "assign", value } as EventTarget &
                              HTMLInputElement,
                          } as React.ChangeEvent<HTMLInputElement>)
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an assignee" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unknown">Unknown</SelectItem>
                          <SelectItem value="aidan">aidan</SelectItem>
                          <SelectItem value="madeline">madeline</SelectItem>
                          <SelectItem value="mom">mom</SelectItem>
                          <SelectItem value="dad">dad</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label htmlFor="description">Description</label>
                      <Input
                        id="description"
                        name="description"
                        value={newHeirloom.description}
                        onChange={handleDialogChange}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="image">Image</label>
                      <Input
                        type="file"
                        id="image"
                        name="image"
                        accept="image/*"
                        onChange={handleDialogImageChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" variant="default">
                      Submit
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>
      {expandedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative">
            <img
              src={expandedImage}
              alt="Expanded Heirloom Image"
              className="max-h-screen max-w-screen"
            />
            <button
              className="absolute top-4 right-4 rounded bg-white p-2 text-black"
              onClick={handleCloseExpandedImage}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
