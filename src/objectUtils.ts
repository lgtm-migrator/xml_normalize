import {XmlElement, XmlNode} from 'xmldoc';
import util from 'util';

export function splitOnLast(str: string, sep: string): [first: string, rest: string] {
    const indexOfLast = str.lastIndexOf('.');
    return [str.substr(0, indexOfLast), str.substr(indexOfLast + 1)];
}

export function getNestedAttribute(obj: any, path: string): any {
    let o = obj;
    path = path.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    path = path.replace(/^\./, '');           // strip a leading dot
    const a = path.split('.');
    for (let i = 0, n = a.length; i < n; ++i) {
        const k = a[i];
        if (k in o) {
            o = o[k];
        } else {
            return;
        }
    }
    return o;
}

export function splitNameAndIndex(nameAndOptionalIndex: string): [name: string, index: number | null] {
    const match = nameAndOptionalIndex.match(/^(.+)\[(\d*)]$/);
    if (!match) { // implicit 0 index
        return [nameAndOptionalIndex, 0];
    } else {
        return [match[1], match.length > 2 && match[2] !== '' && match[2] !== undefined ? parseInt(match[2]) : null];
    }
}

export function* allChildren(el: XmlNode, includeEl = true): IterableIterator<XmlNode> {
    if (includeEl) {
        yield el;
    }
    if (el.type === 'element') {
        for (const c of el.children) {
            yield* allChildren(c, true);
        }
    }
}

/**
 *
 * @param obj
 * @param path must not include tag name of top level element (obj)
 */
export function getNestedAttributes(obj: XmlElement, path: string): XmlElement[] {
    console.debug(`getNestedAttributes path=${path}`);
    return path
        .split('.')
        .filter(part => !!part)
        .reduce(((previousValue, currentValue, i, a) => {
            console.debug(`considering part=${currentValue}`);
            const [tagName, nodeIndex] = splitNameAndIndex(currentValue);
            console.debug(`tagName=${tagName} nodeIndex=${nodeIndex}`);
            if (nodeIndex !== null && nodeIndex !== undefined) {
                return previousValue.map(o => o.childrenNamed(tagName)[nodeIndex])
            } else {
                return previousValue.reduce((all, curr) => [...all, ...curr.childrenNamed(tagName)], [] as XmlElement[]);
            }
        }), [obj] as XmlElement[])
}
