import ImagePage from "@/components/ImagePage";

type Params = { params: { id: string } }

export default function Page({ params: { id } } : Params) {
  return <ImagePage id={id} />;
}
