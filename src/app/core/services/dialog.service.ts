import { ApplicationRef, ComponentRef, EnvironmentInjector, Injectable, Type, createComponent } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class DialogService {
    constructor(
        private appRef: ApplicationRef,
        private injector: EnvironmentInjector
    ) { }

    open(component: Type<any>, config: { data?: any } = {}) {
        // Create the component
        const componentRef = createComponent(component, {
            environmentInjector: this.injector
        });

        // Set inputs from data
        if (config.data) {
            Object.assign(componentRef.instance, config.data);
        }

        // Attach to the application view (change detection)
        this.appRef.attachView(componentRef.hostView);

        // Get the DOM element and append to body
        const domElem = (componentRef.hostView as any).rootNodes[0] as HTMLElement;
        document.body.appendChild(domElem);

        // Handle close event if the component has one
        if (componentRef.instance.closeEvent) {
            const sub = componentRef.instance.closeEvent.subscribe(() => {
                this.destroy(componentRef, domElem, sub);
            });
        }

        return {
            close: () => {
                if (componentRef.instance.close) {
                    componentRef.instance.close();
                } else {
                    // Fallback if no close method, just destroy
                    this.appRef.detachView(componentRef.hostView);
                    domElem.remove();
                }
            }
        };
    }

    private destroy(componentRef: ComponentRef<any>, domElem: HTMLElement, sub?: any) {
        this.appRef.detachView(componentRef.hostView);
        domElem.remove();
        componentRef.destroy();
        if (sub) {
            sub.unsubscribe();
        }
    }
}
