import BrandCreate from "./BrandCreate";
import CategoryCreate from "./CategoryCreate";

export default function Page() {
  return (
    <>
      <div className="d-flex" style={{ width: "101%", gap: "2%" }}>
        <CategoryCreate />
        <BrandCreate />
      </div>
    </>
  );
}
