
function observeScroll(element: HTMLElement, callback: () => void): () => void {
    const listener = (e: Event) => {
        if ((e.target as HTMLElement).contains(element)) {
            callback();
        }
    };

    document.addEventListener('scroll', listener, { capture: true });
    return () => {
        document.removeEventListener('scroll', listener, { capture: true });
    };
}

function observeSize(element: HTMLElement, callback: () => void): () => void {
    const resizeObserver = new ResizeObserver(() => {
        callback();
    });
    resizeObserver.observe(element);
    return () => {
        resizeObserver.disconnect();
    };
}

function observePosition(element: HTMLElement, callback: () => void): () => void {
    const box = element.getBoundingClientRect()
    const rootBox = document.documentElement.getBoundingClientRect()
    const rootHeight = rootBox.height || window.innerHeight
    const rootWidth = rootBox.width || window.innerWidth


    //闭包
    let intersectionObserver = new IntersectionObserver(intersectionObserverCallBack, {
        root: document,
        rootMargin: `-${box.top}px -${rootWidth - box.right}px -${rootHeight - box.bottom}px -${box.left}px`,
        threshold: [0.99, 0.98, 0.97, 0.96, 0.95, 0.94, 0.93, 0.92, 0.91, 0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.1]
    });
    let firstTrigger = false
    intersectionObserver.observe(element);
    function intersectionObserverCallBack(entries: IntersectionObserverEntry[]) {
        console.log('firstTrigger', firstTrigger, element.getBoundingClientRect())
        if (firstTrigger) {
            firstTrigger = false
            return
        }
        callback();

        setTimeout(() => {
            firstTrigger = true
            const box = element.getBoundingClientRect()
            intersectionObserver.disconnect();
            intersectionObserver = new IntersectionObserver(intersectionObserverCallBack, {
                root: document,
                rootMargin: `-${box.top}px -${rootWidth - box.right}px -${rootHeight - box.bottom}px -${box.left}px`,
                threshold: [0.99, 0.98, 0.97, 0.96, 0.95, 0.94, 0.93, 0.92, 0.91, 0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.1]
            });
            intersectionObserver.observe(element);
        }, 0)
    }

    return () => {
        intersectionObserver.disconnect();
    };
}

export function observeBoundingBox(element: HTMLElement, callback: () => void): () => void {
    const destroyScroll = observeScroll(element, callback);
    const destroySize = observeSize(element, callback);
    const destroyPosition = observePosition(element, callback);
    return () => {
        destroyScroll();
        destroySize();
        destroyPosition();
    };
}