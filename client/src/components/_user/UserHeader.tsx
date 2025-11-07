import React from "react";
import { ComicText } from "../ui/comic-text";
import { Button } from "../ui/button";

const UserHeader = () => {
  return (
    <div>
      <span className="flex justify-between px-4 py-2">
        <ComicText className="text-xs ">D'mello</ComicText>

        <span className="flex gap-4">
          <Button className="cursor-pointer bg-purple-200 text-purple-600 hover:bg-purple-300 p-4 mt-2 mr-2">
            Cart
          </Button>
          <Button>My Profile</Button>
        </span>
      </span>
      <hr></hr>
    </div>
  );
};

export default UserHeader;
