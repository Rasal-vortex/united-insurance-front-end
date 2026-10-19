import App from "@/App";

export default async function CatchAllPage({ params }) {
  const { path = [] } = await params;
  const initialPath = path.length ? `/${path.join("/")}` : "/";
  return <App initialPath={initialPath} />;
}
