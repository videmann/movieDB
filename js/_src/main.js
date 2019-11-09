// TODO:
// 1. getPosters
// 2. getIMDB url
// 3. remove Button when no more result
// 4. add tips "change input language"
// 5. sort films by rating
// 6. refactoring: one fetch function
// 7. let come comments

// try to write on react


// begin. Обертка для создания ноды
const app = (function(){
    class DOM { // Делаю классом, чтобы был свой this
        // создаем самостоятельную ноду
        create (tagName = 'div', params = {}) {
            // временная нода
            let node = document.createElement(tagName)
            // добавляем атрибуты ноде
            if (params.attributes) Object.keys(params.attributes).forEach(key => {node.setAttribute(key, params.attributes[key])})
            // добавляем события ноде
            if (params.events) Object.keys(params.events).forEach(event => {node.addEventListener(event, params.events[event])})
            // если есть детишчки - добавляем
            if (params.children) params.children.forEach(child => {node.appendChild(child)})
            // иначе добавляем текст
            if (params.text && !params.children) node.innerText = params.text
            // возвращаем полноценную ноду
            return node
        }
        // создаем и вкладываем ноду
        append (tagName, params, parentNode = document.body) {
            parentNode.appendChild(this.create(tagName, params))
        }
    }
    const Dom = new DOM()
    // end.


    class THE_MOVIE_DATABASE {
        constructor(params) {
            this.api_key_v3 = params.api.key_v3
            this.api_key_v4 = params.api.key_v4
            this.api_url    = 'https://api.themoviedb.org/3/' // default api url
            this.api_auth   = 'authentication/token/new' // api token url
            this.api_sess   = 'authentication/guest_session/new' // session api url
            this.poster_path = 'https://image.tmdb.org/t/p/'
            this.placeholder = 'http://placehold.it/500x750?text=Placeholder'
            this.locale     = navigator.languages[1]
            this.query      = ''
            this.session_id = ''
            this.token      = ''
            this.buttonOn   = false
        }

        async request(req, locale = this.locale) {
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
            if (type == 'search') {
                URL = `${this.api_url}search/movie?api_key=${this.api_key_v3}&language=${params.language||'ru'}&query=${params.query.toLowerCase().replace(/\s/, '+')}&page=${params.page||1}&include_adult=${params.adult||false}`
            }
            if (type == 'multi') {
                URL = `${this.api_url}movie/${params.id}?api_key=${this.api_key_v3}&language=ru&append_to_response=videos,images,credits`
            }
            if (type == 'top_rated') {
                URL = `${this.api_url}movie/top_rated?api_key=${this.api_key_v3}&language=${params.language||'ru'}&page=${params.page||1}`
            }
            
            try {
                let response = await fetch(URL)
                let data = await response.json()

                params.query ? this.query = params.query.toLowerCase().replace(/\s/, '+') : null
                // success callback
                params.onLoad ? params.onLoad() : null
                // return promise
                return data
            } catch (error) {
                // error callback
                throw new Error(error)
            }
        }
        // главный метод запроса и обработки запроса с функционалом генерации тегов.
        getMovies(params) {
            if (!params) return
            // add isLoading
            document.querySelector('.layout__body').classList.add('isLoading')

            this.xhr(params.type ? params.type : 'search', {
                query: params.value ? params.value : '',
                page: params.page,
                //adult: true // do not enable::108
            })
            .then(searchResponse => {
                if (params.clear) {
                    filmFactory.films.innerHTML = ''
                    if(document.querySelector('.button--load-more')) document.querySelector('.button--load-more').remove()
                }

                if(searchResponse && searchResponse.results != 'undefined') {
                    searchResponse.results
                    //.filter(item => item.adult == true) //do not enable::98
                    // sorting by popularity 10 > 1
                    .sort((a, b) => a.popularity > b.popularity ? -1 : a.popularity < b.popularity ? 1 : 0)
                    // appeding film
                    .forEach((film, index) => {
                        filmFactory.appendFilm({
                            id: film.id,
                            picture: film.poster_path ? `${this.poster_path}w500${film.poster_path}` : this.placeholder,
                            uri: film.url,
                            title: film.title,
                            popularity: film.popularity
                        }, index)
                    })
                }
                
                if (params.value) {
                    // moreButton
                    if (searchResponse.results.length == 20) {
                        if (params.clear) filmFactory.appendMoreButton()
                        // increment
                        document.querySelector('.button--load-more').dataset.page = searchResponse.page + 1
                    }
                    // remove button if not enough results
                    if (searchResponse.results.length > 0 && searchResponse.results.length < 20 && this.buttonOn == true) document.querySelector('.button--load-more').remove()
                }

                // remove isLoading
                document.querySelector('.layout__body').classList.remove('isLoading')
            })
        }
    }
    // апи
    const TMDB = new THE_MOVIE_DATABASE({
        api: {
            key_v3: '205fb47ab8a8be3753cb2bf6824d8506',
            key_v4: 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyMDVmYjQ3YWI4YThiZTM3NTNjYjJiZjY4MjRkODUwNiIsInN1YiI6IjVkYmQ3Y2EwYzhhMmQ0MDAxNGEyNjdjOSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.KFpKVgos6Pkr2LbBceaZ3autcZmkdRViWhfIkF86h3M'
        }
    })

    class FILM_FACTORY {
        constructor (params) {
            this.container = document.getElementById(params.container)
            this.films = document.getElementById(params.films)
        }
        appendFilm (object, index) {
            Dom.append('article', {
                attributes: {
                    'class': 'grid__item film',
                    'tabindex': index + 2
                },
                children: [
                    Dom.create('figure', {
                        children: [
                            Dom.create('img', {
                                attributes: {
                                    'class': 'img img--responsive',
                                    'alt': object.title,
                                    'src': object.picture
                                }
                            }),
                            Dom.create('figcaption', {
                                children: [
                                    Dom.create('a', {
                                        attributes: {
                                            'class': 'film__uri',
                                            'href': object.uri,
                                            'target': '_blank',
                                            'data-id': object.id
                                        },
                                        children: [
                                            Dom.create('h2', {
                                                attributes: {
                                                    'class': 'film__title'
                                                },
                                                text: object.title
                                            })
                                        ],
                                        events: {
                                            // ссылка сохраняется для возможности переключения режимов (быстрый просмотр или переход по ссылке)
                                            click: (e) => {
                                                e.preventDefault();
                                                // объединение большого количества запросов в один, средствами API, чтобы не бегать за данными раз за разом
                                                TMDB.xhr('multi', {
                                                    id: object.id
                                                })
                                                .then(film => {
                                                    this.modal({
                                                        overview: film.overview,
                                                        credits: film.credits.cast,
                                                        has_video: film.videos.results.length != 0,
                                                        video: `https://www.youtube.com/embed/${film.videos.results.length > 0 ? film.videos.results[0].key : ''}`,
                                                        poster: `https://image.tmdb.org/t/p/w300${film.poster_path}`
                                                    })
                                                })
                                            }
                                        }
                                    })
                                ]
                            })
                        ]
                    }),
                    Dom.create('footer', {
                        children: [
                            Dom.create('dl', {
                                attributes: {
                                    'class': 'film__director'
                                },
                                children: [
                                    Dom.create('dt', {
                                        text: 'Популярность'
                                    }),
                                    Dom.create('dd', {
                                        text: object.popularity
                                    })
                                ]
                            })
                        ]
                    })
                ]
            }, this.films)
        }

        appendMoreButton () {
            Dom.append('div', {
                attributes: {
                    'class': 'align_x--center'
                },
                children: [
                    Dom.create('button', {
                        attributes: {
                            'type': 'button',
                            'class': 'button button_theme--blue button--load-more'
                        },
                        text: 'Показать ещё'
                    })
                ],
                events: {
                    'click': function (e) {
                        TMDB.getMovies({
                            value: TMDB.query,
                            page: e.target.dataset.page,
                            clear: false
                        })
                    }
                }
            }, this.container)
            // appended
            TMDB.buttonOn = true;
        }

        modal (params) {
            Dom.append('div', {
                attributes: {
                    'class':'modal'
                },
                children: [
                    Dom.create('div', {
                        attributes: {
                            'class':'modal__overlay'
                        },
                        events: {
                            click: function() {
                                this.parentElement.remove()
                                document.querySelector('body').classList.remove('modal-show')
                            }
                        }
                    }),
                    Dom.create('div', {
                        attributes: {
                            'class':'modal__body'
                        },
                        children: [
                            Dom.create('div', {
                                attributes: {
                                    'class': `modal__pic ${params.has_video ? 'has-video' : ''}`,
                                    'style': `background-image: url('${params.poster}')`,
                                    'data-video': params.video
                                },
                                events: {
                                    click: function() {
                                        if(this.classList.contains('has-video')) {
                                            this.parentElement.replaceWith(Dom.create('iframe', {
                                                attributes: {
                                                    'class':'modal__video',
                                                    'src': this.dataset.video,
                                                    'frameborder': 0,
                                                    'allowfullscreen': '',
                                                    'allow': 'autoplay; encrypted-media;'
                                                }
                                            }))
                                        }
                                    }
                                }
                            }),
                            Dom.create('div', {
                                attributes: {
                                    'class': 'modal__details'
                                },
                                children: (() => {
                                    let array = []
                                    // описание
                                    array.push(Dom.create('p', {
                                        attributes: {
                                            'class': 'modal__description'
                                        },
                                        text: params.overview}
                                    ))
                                    // актеры
                                    params.credits.forEach(row => {
                                        array.push(Dom.create('dl', {
                                            children: [
                                                Dom.create('dd', {
                                                    text: row.character
                                                }),
                                                Dom.create('dt', {
                                                    text: row.name
                                                })
                                            ]
                                        }))
                                    })

                                    return array
                                })()
                            })
                        ]
                    })
                ]
            }, document.querySelector('body'))
            document.querySelector('body').classList.add('modal-show')
        }
    }

    const filmFactory = new FILM_FACTORY({
        container: 'container',
        films: 'films'
    })

    const init = () => {
        let inputDelay;
        let simpleMode = true; //change it to search by input => Warning! To many bugs
        // TMDB auth
        TMDB.auth()
        .then(() => TMDB.newSession())
        // first screen - top rated movies
        TMDB.getMovies({type: 'top_rated', clear: true})

        // search
        document.querySelector('.input__search-input').addEventListener('keyup', function(e){
            // empty
            if (!this.value) return;
            if (simpleMode) {
                if (e.keyCode == 13) TMDB.getMovies({value: this.value, clear: true})
            } else {
                // mobile device. search on enter. cheaper
                if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                    // enter
                    if (e.keyCode == 13) TMDB.getMovies({value: this.value, clear: true})
                // other device
                } else {
                    // input
                    inputDelay = setTimeout(() => {
                        // new request, clear list
                        TMDB.getMovies({value: this.value, clear: true})
                    // input delay .5s - not fast & not slow
                    }, 1000)
                }
            }
        })

        // clear inputDelay
        document.querySelector('.input__search-input').addEventListener('keydown', () => {
            clearTimeout(inputDelay)
        })

        // hide input label
        document.querySelector('.input__search-input').addEventListener('blur', function(){
            const label = this.parentNode.querySelector('label')
            this.value != ''
            ? label.setAttribute('style','display:none')
            : label.removeAttribute('style','display:none')
        })

        // clear input on load
        document.querySelector('.input__search-input').value = ''
    }

    document.addEventListener('DOMContentLoaded', init)
})()
// Комментарии к коду

// Заранее извиняюсь за лапшекод...

// Как Вы уже заметили, я использовал другой API, более функциональный и показательный, но в то же время ничуть не проще в реализации, так как он требует получение Токена и создания сессии.
// Верстка идентичная макету, отличаются размеры изображений - API таких маленьких не выдает.
// Помимо описанного в задании функционала, реализован быстрый просмотр и вывод видео, при его наличии в попапе.
// Также, фильмы сортируются по рейтингу от большего к малому.


// Было желание сделать модульную структуру и использовать import/export, но сборщик стал сопротивляться
// По хорошему, из функции init надо убрать лишнее. Например, слушателя событий на input лучше ставить сразу при генерации тега, очистка рабочего поля тоже засоряет
// Реализован поиск по вводу и по нажатию Enter, однако, поиск по вводу очень сырой, использовать его пока не стоит, хотя попробовать можете
// Поиск по вводу сделан при помощи таймаута в 1 секунду, и даже этого иногда мало. Для защиты от перебора по X-Rate-Limit можно было бы посчитать задержку, гаранирующую вхождение в условия пользования сервисом.
// Для мобильных устройств поиск по вводу выключен в целях экономии трафика.

// В Верстке использовал Гриды и флексы. идеальная парочка. Однако, для обратной совместимости оставил inline-block. Верстку не тестировал на IE

// Баги:
// Необходимо почистить код от повторов и глупого кода типа "this.value != '' ? label.setAttribute('style','display:none') : label.removeAttribute('style','display:none')"
// Кнопка показать больше... С ней было больше всего проблем, многие из которых остались.

// Что хотелось бы сделать
// Определенно, сделал бы я это "приложение" на React или Vue, кода было бы в разы меньше, вместе с этим модульная структура позволила бы реализовать паттерн MVC.
// Код стал бы красивым, легко читаемым и легко поддерживаемым.

// P.S.: Случайно заметил в ответе от сервера свойство Adult. 98 и 108 строки, если что ;)