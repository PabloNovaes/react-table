import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { FileDown, MoreHorizontal, Plus, Search } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "./components/header";
import { Pagination } from "./components/pagination";
import { Tabs } from "./components/tabs";
import { Button } from "./components/ui/button";
import { Control, Input } from "./components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./components/ui/table";
import { useDebonceValue } from "./hooks/use-debounce-value";

export interface TagResponse {
  first: number
  prev: number | null
  next: number
  last: number
  pages: number
  items: number
  data: Tag[]
}

export interface Tag {
  title: string
  slug: string
  amountOfVideos: number
  id: string
}


export function App() {
  const [searchParams] = useSearchParams()
  const [filter, setFilter] = useState('')

  const debouncedFilter = useDebonceValue(filter, 1000)

  const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1



  const { data: tagsResponse, isLoading } = useQuery<TagResponse>({
    queryKey: ['get-tags', page, debouncedFilter],
    queryFn: async () => {
      const response = await fetch(`http://192.168.0.174:3000/tags?_page=${page}&_per_page=10`)
      const tags = await response.json()

      if (debouncedFilter === "") return tags
      return {
        ...tags,
        data: tags.data.filter((tag) => tag.title.toLowerCase().startsWith(debouncedFilter.toLowerCase()))
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60,
  })


  if (isLoading) return null

  return (
    <div className="py-6 space-y-8">
      <div>
        <Header />
        <Tabs />
      </div>
      <div>
        <main className="max-w-6xl mx-auto space-y-5 ">
          <div className="flex px-4 items-center gap-3">
            <h1 className="text-xl font-bold ">Tags</h1>
            <Button variant="primary">
              Create new
              <Plus className="size-3 " />
            </Button>
          </div>

          <div className="flex px-4 items-center justify-between">
            <Input variant="filter">
              <Search className="size-3" />
              <Control placeholder="Search tags..."
                onChange={e => setFilter(e.target.value)}
                value={filter}
              />
            </Input>


            <Button>
              <FileDown className="size-3" />
              Export
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Amount of videos</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tagsResponse?.data.map((tag) => {
                return (
                  <TableRow key={tag.id}>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">{tag.title}</span>
                        <span className="text-xs text-zinc-500">{tag.id}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-300">
                      {`${tag.amountOfVideos} video(s)`}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="icon">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          {tagsResponse && <Pagination pages={tagsResponse.pages} items={tagsResponse.items} page={page} />}
        </main>
      </div>
    </div>
  )
}

