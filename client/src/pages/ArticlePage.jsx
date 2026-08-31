export const ArticlePage = () => {
  return (
    <div className="m-3 px-2">
      <div className="card bg-base-100 w-96 shadow-sm">
        <figure>
          <img
            src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
            alt="Shoes"
          />
        </figure>
        <div className="card-body text-black px-2 py-2">
          <h2 className="card-title ">
            Card Title
            <div className="badge badge-secondary  rounded-xl p-2 ">NEW</div>
          </h2>
          <p>
            A card component has a figure, a body part, and inside body there
            are title and actions parts
          </p>
          <div className="card-actions justify-end">
            <button className="bg-primary rounded-xl p-2 text-white">
              <div className="badge badge-outline ">Products</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
