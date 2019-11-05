class APP {
    constructor(params) {
        this.db = new MOVIE_DB(params.db)
        this.DOM = new NODE_FACTORY()
        this.films = new FILM_FACTORY(params.dom)
    }
}