import { OperatingMode } from "../mode"
import { INSTANCE } from "../cad"

export class EventManager {


    constructor() {

        onmousemove = (event: MouseEvent) => {
            INSTANCE.getCommandManager().handleMouseMove(event);
        };

        onresize = () => {
            INSTANCE.getRenderer().updateScreenSize();
        }

        onkeydown =  (event: KeyboardEvent) => {
            if (event.code == "Tab") {
                if (INSTANCE.getMode() == OperatingMode.Navigation) {
                    INSTANCE.setMode(OperatingMode.Command);
                } else {
                    INSTANCE.getCli().clearInput();
                    INSTANCE.setMode(OperatingMode.Navigation);
                }
                // prevent tab from chaging focus
                event.preventDefault();
                event.stopPropagation();
            } else {
                if (INSTANCE.getMode() == OperatingMode.Command) INSTANCE.getCli().processKeyDownEvent(event);
            }
        };

        onfocus = () => {
            INSTANCE.getStats().reset();
        }

        onclick = (event: MouseEvent) => {
            INSTANCE.getCommandManager().handleClickInput(event);
            INSTANCE.getCli().render();
        }

    }



}

