class FILM_FACTORY {
    constructor (params) {
        this.container = document.getElementById(params.container)
        this.films = document.getElementById(params.films)
    }
    appendFilm (object, index) {
        nodeFactory.setIn('article', {
            attributes: {
                'class': 'grid__item film',
                'tabindex': index
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
                        'class': 'button button_theme--blue'
                    },
                    text: 'Показать ещё'
                })
            ],
            events: {
                'click': () => {
                    console.log('click')
                }
            }
        }, this.container)
    }
}