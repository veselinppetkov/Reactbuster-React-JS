const OwnerCatalogNav = () => {
  return (
    <div className="catalog__nav">
      <div className="slider-radio">
        <input type="radio" name="grade" id="featured" />
        <label htmlFor="featured">Featured</label>
        <input type="radio" name="grade" id="popular" />
        <label htmlFor="popular">Popular</label>
        <input type="radio" name="grade" id="newest" />
        <label htmlFor="newest">Newest</label>
      </div>
    </div>
  );
};

export default OwnerCatalogNav;
