const CatalogNav = () => {
  return (
    <div className="catalog__nav">
      {/* <div className="catalog__select-wrap">
        <select className="catalog__select" name="genres">
          <option value="All genres">All genres</option>
          <option value="Action/Adventure">Action/Adventure</option>
          <option value="Animals">Animals</option>
          <option value="Animation">Animation</option>
          <option value="Biography">Biography</option>
          <option value="Comedy">Comedy</option>
          <option value="Cooking">Cooking</option>
          <option value="Dance">Dance</option>
          <option value="Documentary">Documentary</option>
          <option value="Drama">Drama</option>
          <option value="Education">Education</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Family">Family</option>
          <option value="Fantasy">Fantasy</option>
          <option value="History">History</option>
          <option value="Horror">Horror</option>
          <option value="Independent">Independent</option>
          <option value="International">International</option>
          <option value="Kids & Family">Kids & Family</option>
          <option value="Medical">Medical</option>
          <option value="Military/War">Military/War</option>
          <option value="Music">Music</option>
          <option value="Mystery/Crime">Mystery/Crime</option>
          <option value="Nature">Nature</option>
          <option value="Paranormal">Paranormal</option>
          <option value="Politics">Politics</option>
          <option value="Racing">Racing</option>
          <option value="Romance">Romance</option>
          <option value="Sci-Fi/Horror">Sci-Fi/Horror</option>
          <option value="Science">Science</option>
          <option value="Science Fiction">Science Fiction</option>
          <option value="Science/Nature">Science/Nature</option>
          <option value="Travel">Travel</option>
          <option value="Western">Western</option>
        </select>

        <select className="catalog__select" name="years">
          <option value="All the years">All the years</option>
          <option value="1">'50s</option>
          <option value="2">'60s</option>
          <option value="3">'70s</option>
          <option value="4">'80s</option>
          <option value="5">'90s</option>
          <option value="6">2000-10</option>
          <option value="7">2010-20</option>
          <option value="8">2021</option>
        </select>
      </div> */}

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

export default CatalogNav;
