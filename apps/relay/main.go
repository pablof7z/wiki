package main

import (
	"context"
	"fmt"
	"net/http"
	"slices"

	"github.com/fiatjaf/eventstore/sqlite3"
	"github.com/fiatjaf/khatru"
	"github.com/nbd-wtf/go-nostr"
)

func main() {
	allowedKinds := [...]int{30818, 30819, 818, 819}
	relay := khatru.NewRelay()

	db := sqlite3.SQLite3Backend{DatabaseURL: "./db"}
	if err := db.Init(); err != nil {
		panic(err)
	}

	relay.Info.Name = "Wikifreedia relay"
	relay.Info.PubKey = "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52"
	relay.Info.Description = "This is a relay for wiki events. It supports search."

	relay.StoreEvent = append(relay.StoreEvent, db.SaveEvent)
	relay.QueryEvents = append(relay.QueryEvents, db.QueryEvents)
	relay.CountEvents = append(relay.CountEvents, db.CountEvents)
	relay.DeleteEvent = append(relay.DeleteEvent, db.DeleteEvent)
	relay.RejectEvent = append(relay.RejectEvent,
		func(ctx context.Context, event *nostr.Event) (reject bool, msg string) {
			if !slices.Contains(allowedKinds[:], event.Kind) {
				return true, "only wiki events are allowed here."
			}
			return false, "" // anyone else can
		},
	)

	fmt.Println("running on :3334")
	http.ListenAndServe(":3334", relay)
}
