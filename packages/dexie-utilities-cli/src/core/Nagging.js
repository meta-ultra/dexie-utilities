class Nagging {
  eager = true;
  naggings = [];

  nag(message) {
    this.naggings.push(message);
    if (this.eager) {
      this.spit();
    }
  }

  spit() {
    throw JSON.stringify(this.naggings);
  }

  clear() {
    this.naggings = [];
  }
}

module.exports = Nagging;