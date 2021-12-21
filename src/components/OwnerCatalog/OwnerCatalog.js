import OwnerCatalogHead from "./OwnerCatalogHead";
import OwnerCatalogMain from "./OwnerCatalogMain";

const OwnerCatalog = ({ userId }) => {
  return (
    <>
      <OwnerCatalogHead />
      <OwnerCatalogMain userId={userId} />
    </>
  );
};
export default OwnerCatalog;
