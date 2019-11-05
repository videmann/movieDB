// TODO:
// 1. getPosters
// 2. getIMDB url
// 3. remove Button when no more result
// 4. add tips "change input language"
// 5. sort films by rating
// 6. refactoring: one fetch function
// 7. let come comments

// try to write on react

class MOVIE_DB {
    constructor(params) {
        this.api_key_v3 = params.api.key_v3
        this.api_key_v4 = params.api.key_v4
        this.api_url    = 'https://api.themoviedb.org/3/' // default api url
        this.api_auth   = 'authentication/token/new' // api token url
        this.api_sess   = 'authentication/guest_session/new' // session api url
        this.query      = ''
        this.session_id = ''
        this.token      = ''
    }

    async request(req, locale = 'ru') {
        try {
            let response = await fetch(`${this.api_url}${req}?api_key=${this.api_key_v3}&language=${locale}&page=${this.page}`)
            let result = await response.json()

            return result
        } catch (error) {
            throw new Error(error)
        }
    }

    async newSession() {
        this.session_id = await this.request(this.api_sess)
    }

    async newToken() {
        this.token = await this.request(this.api_auth)
    }

    auth() {
        return new Promise(async (resolve, reject) => {
            try {
                await this.newToken()
                resolve(this.token)
            } catch (error) {
                reject()
                throw new Error(error)
            }
        })
    }

    async xhr (type, params) {
        if (!params) return
        // before
        params.before ? params.before() : null
        // url
        let URL = ''
        switch(type) {
            case 'search':
                URL = `${this.api_url}search/movie?api_key=${this.api_key_v3}&language=${params.language||'ru'}&query=${params.query.toLowerCase().replace(/\s/, '+')}&page=${params.page||1}&include_adult=${params.adult||false}`
                break
            case 'multi':
                URL = `${this.api_url}movie/${params.id}?api_key=${this.api_key_v3}&append_to_response=videos,images,credits`
                break
            default:
                URL = `${this.api_url}movie/top_rated?api_key=${this.api_key_v3}&language=${params.language||'ru'}&page=${params.page||1}`
        }
        try {
            let response = await fetch(URL)
            let data = await response.json()

            this.query = params.query.toLowerCase().replace(/\s/, '+')
            // success callback
            params.onLoad ? params.onLoad() : null
            // return promise
            return data
        } catch (error) {
            // error callback
            params.error ? params.error(error) : null
        }
    }

    async search(query, page = 1) {
        try {
            let response = await fetch(`${this.api_url}search/movie?api_key=${this.api_key_v3}&language=ru&query=${query.toLowerCase().replace(/\s/, '+')}&page=${page}`)
            let result = await response.json()

            this.query = query
            window.history.pushState('', query.toLowerCase().replace(/\s/, '+'), `?film=${query.toLowerCase().replace(/\s/, '+')}`)

            return result
        } catch (error) {
            throw new Error(`Ошибка в функции поиска. ${error}`)
        }
    }

    loadFilms(params) {
        if (!params) return
        // add isLoading
        nodeFactory.get('.layout__body').classList.add('isLoading')

        this.xhr('search', {
            query: params.value,
            page: params.page,
            // adult: true // do not enable::127
        })
        .then(searchResponse => {
            if (params.clear) {
                filmFactory.films.innerHTML = ''
                if(document.querySelector('.button--load-more')) nodeFactory.get('.button--load-more').remove()
            }

            if(searchResponse) {
                searchResponse.results
                // .filter(item => item.adult == true) do not enable::117
                // sorting by popularity 10 > 1
                .sort((a, b) => a.popularity > b.popularity ? -1 : a.popularity < b.popularity ? 1 : 0)
                // appeding film
                .forEach((film, index) => {
                    filmFactory.appendFilm({
                        picture: `https://image.tmdb.org/t/p/w300${film.poster_path}`,
                        uri: film.url,
                        title: film.title,
                        director: ''
                    }, index)
                })
            }

            if (params.clear) filmFactory.appendMoreButton()

            nodeFactory.get('.button--load-more').setAttribute('data-page', searchResponse.page + 1)
            // remove isLoading
            nodeFactory.get('.layout__body').classList.remove('isLoading')
        })
    }
}

const movieDB = new MOVIE_DB({
    api: {
        key_v3: '205fb47ab8a8be3753cb2bf6824d8506',
        key_v4: 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyMDVmYjQ3YWI4YThiZTM3NTNjYjJiZjY4MjRkODUwNiIsInN1YiI6IjVkYmQ3Y2EwYzhhMmQ0MDAxNGEyNjdjOSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.KFpKVgos6Pkr2LbBceaZ3autcZmkdRViWhfIkF86h3M'
    }
})

class NODE_FACTORY {
    set (tagName = 'div', params = {}) {
        let node = document.createElement(tagName)

        for (let attr in params.attributes) {
            node.setAttribute(attr, params.attributes[attr])
        }

        for (let event in params.events) {
            node.addEventListener(event, params.events[event])
        }

        params.children
        ? (params.children.forEach(child => { node.appendChild(child) }))
        : params.text ? node.innerText = params.text : null

        return node
    }

    setIn (tagName, params, parentNode) {
        parentNode.appendChild(this.set(tagName, params))
    }

    get (selector) {
        if (!selector) return

        return document.querySelector(selector)
    }
}

const nodeFactory = new NODE_FACTORY()

class FILM_FACTORY {
    constructor (params) {
        this.container = document.getElementById(params.container)
        this.films = document.getElementById(params.films)
    }
    appendFilm (object, index) {
        nodeFactory.setIn('article', {
            attributes: {
                'class': 'grid__item film',
                'tabindex': index + 2
            },
            children: [
                nodeFactory.set('figure', {
                    children: [
                        nodeFactory.set('img', {
                            attributes: {
                                'class': 'img img--responsive',
                                'alt': object.title,
                                'src': object.picture
                            }
                        }),
                        nodeFactory.set('figcaption', {
                            children: [
                                nodeFactory.set('a', {
                                    attributes: {
                                        'class': 'film__uri',
                                        'href': object.uri,
                                        'target': '_blank'
                                    },
                                    children: [
                                        nodeFactory.set('h2', {
                                            attributes: {
                                                'class': 'film__title'
                                            },
                                            text: object.title
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                }),
                nodeFactory.set('footer', {
                    children: [
                        nodeFactory.set('dl', {
                            attributes: {
                                'class': 'film__director'
                            },
                            children: [
                                nodeFactory.set('dt', {
                                    text: 'Режиссер'
                                }),
                                nodeFactory.set('dd', {
                                    text: object.director
                                })
                            ]
                        })
                    ]
                })
            ]
        }, this.films)
    }

    appendMoreButton () {
        nodeFactory.setIn('div', {
            attributes: {
                'class': 'align_x--center'
            },
            children: [
                nodeFactory.set('button', {
                    attributes: {
                        'type': 'button',
                        'class': 'button button_theme--blue button--load-more'
                    },
                    text: 'Показать ещё'
                })
            ],
            events: {
                'click': function (e) {
                    movieDB.loadFilms({
                        value: movieDB.query,
                        page: e.target.dataset.page,
                        clear: false
                    })
                }
            }
        }, this.container)
    }
}

const filmFactory = new FILM_FACTORY({
    container: 'container',
    films: 'films'
})

const init = () => {
    let inputDelay;
    // movieDB auth
    movieDB.auth()
    .then(() => movieDB.newSession())

    nodeFactory.get('.input__search-input').addEventListener('keyup', function(e){
        // search on enter
        if (e.keyCode == 13) movieDB.loadFilms({value: this.value, clear: true})

        // search on input
        inputDelay = setTimeout(() => {
            movieDB.loadFilms({value: this.value, clear: true})
        }, 500)
    })

    // clear inputDelay
    nodeFactory.get('.input__search-input').addEventListener('keydown', () => {
        clearTimeout(inputDelay)
    })

    // hide input label
    nodeFactory.get('.input__search-input').addEventListener('blur', function(){
        const label = this.parentNode.querySelector('label')
        this.value != ''
        ? label.setAttribute('style','display:none')
        : label.removeAttribute('style','display:none')
    })

    // clear input on load
    nodeFactory.get('.input__search-input').value = ''
}

document.addEventListener('DOMContentLoaded', init)