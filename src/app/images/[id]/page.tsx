import ImagePage from "@/components/ImagePage";

type Params = { params: Promise<{ id: string }> }

export default async function Page(props: Params) {
  const params = await props.params;

  const {
    id
  } = params;

  return <ImagePage id={id} />;
}
