import { Link } from "react-router-dom";
const Cata = () => {
  return (
    <section className="section section--pb0">
      <div className="container">
        <div className="row row--grid">
          <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
            <Link to="/catalog" className="category">
              <div className="category__cover">
                <img src="img/category/1.jpg" alt="" />
              </div>
              <h3 className="category__title">Action</h3>
              <span className="category__value">10</span>
            </Link>
          </div>

          <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
            <Link to="/catalog" className="category">
              <div className="category__cover">
                <img src="img/category/2.jpg" alt="" />
              </div>
              <h3 className="category__title">Comedy</h3>
              <span className="category__value">4</span>
            </Link>
          </div>

          <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
            <Link to="/catalog" className="category">
              <div className="category__cover">
                <img src="img/category/3.jpg" alt="" />
              </div>
              <h3 className="category__title">Documentary</h3>
              <span className="category__value">15</span>
            </Link>
          </div>

          <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
            <Link to="/catalog" className="category">
              <div className="category__cover">
                <img src="img/category/4.jpg" alt="" />
              </div>
              <h3 className="category__title">History</h3>
              <span className="category__value">2</span>
            </Link>
          </div>

          <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
            <Link to="/catalog" className="category">
              <div className="category__cover">
                <img src="img/category/5.jpg" alt="" />
              </div>
              <h3 className="category__title">Horror</h3>
              <span className="category__value">12</span>
            </Link>
          </div>

          <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
            <Link to="/catalog" className="category">
              <div className="category__cover">
                <img src="img/category/6.jpg" alt="" />
              </div>
              <h3 className="category__title">Science Fiction</h3>
              <span className="category__value">15</span>
            </Link>
          </div>

          <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
            <Link to="/catalog" className="category">
              <div className="category__cover">
                <img src="img/category/7.jpg" alt="" />
              </div>
              <h3 className="category__title">Adventure</h3>
              <span className="category__value">14</span>
            </Link>
          </div>

          <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
            <Link to="/catalog" className="category">
              <div className="category__cover">
                <img src="img/category/8.jpg" alt="" />
              </div>
              <h3 className="category__title">Western</h3>
              <span className="category__value">12</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Cata;
