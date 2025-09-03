import Connection from "./Connection";

const connectionInstance = new Connection(`${window.location.host}/ws`);

export default connectionInstance;
