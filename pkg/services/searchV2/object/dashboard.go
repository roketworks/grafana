package object

import (
	"bytes"
	"fmt"
	"strconv"

	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/services/searchV2/dslookup"
	"github.com/grafana/grafana/pkg/services/searchV2/extract"
	"github.com/grafana/grafana/pkg/services/store/object"
)

func NewDashboardSummaryBuilder(lookup dslookup.DatasourceLookup) object.ObjectSummaryBuilder {
	return func(obj object.RawObject) (object.ObjectSummary, error) {
		summary := object.ObjectSummary{
			Labels: make(map[string]string),
			Fields: make(map[string]interface{}),
		}
		stream := bytes.NewBuffer(obj.Body)
		dash, err := extract.ReadDashboard(stream, lookup)
		if err != nil {
			summary.Error = err.Error()
			return summary, err
		}

		refs := object.NewReferenceAccumulator()
		url := fmt.Sprintf("/d/%s/%s", obj.UID, models.SlugifyTitle(dash.Title))
		summary.Name = dash.Title
		summary.Description = dash.Description
		summary.URL = url
		for _, v := range dash.Tags {
			summary.Labels[v] = ""
		}
		if len(dash.TemplateVars) > 0 {
			summary.Fields["hasTemplateVars"] = true
		}

		for _, panel := range dash.Panels {
			refP := object.NewReferenceAccumulator()
			p := object.NestedObjectSummary{
				UID:  obj.UID + "#" + strconv.FormatInt(panel.ID, 10),
				Kind: "panel",
			}
			p.Name = panel.Title
			p.Description = panel.Description
			p.URL = fmt.Sprintf("%s?viewPanel=%d", url, panel.ID)
			p.Fields = make(map[string]interface{}, 0)

			refP.Add("panel", panel.Type, "")
			for _, v := range panel.Datasource {
				refs.Add("ds", v.Type, v.UID) // dashboard refs
				refP.Add("ds", v.Type, v.UID) // panel refs
			}

			for _, v := range panel.Transformer {
				refP.Add("transformer", v, "")
			}

			refs.Add("panel", panel.Type, "")
			p.References = refP.Get()
			summary.Nested = append(summary.Nested, p)
		}

		summary.References = refs.Get()
		return summary, nil
	}
}
