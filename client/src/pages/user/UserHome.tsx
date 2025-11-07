import UserHeader from "@/components/_user/UserHeader";
import OffersCard from "@/components/OffersCard";
import Products from "@/components/Products";

const UserHome = () => {
  return (
    <div>
      <UserHeader></UserHeader>
      <OffersCard></OffersCard>
      <Products></Products>
    </div>
  );
};

export default UserHome;
