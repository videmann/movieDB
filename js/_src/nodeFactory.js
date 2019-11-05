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
        return document.querySelector(selector)
    }
}